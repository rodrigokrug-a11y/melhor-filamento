import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Remove os dados de DEMONSTRAÇÃO do seed que foram parar em produção:
//   • Lojas fictícias (apontam para example.com.br): loja-maker-sp, mundo-3d, megastore
//     — junto com as ofertas, snapshots de preço, cliques, regras de frete e fontes delas.
//     — leads vinculados a essas ofertas são PRESERVADOS (só desvinculados da oferta).
//   • Produtos demo sem equivalente real: as 2 resinas do seed
//     (resina-voolt-standard-cinza-1l e resina-printalot-tough-transparente-500g),
//     removidos APENAS se não restar nenhuma oferta de loja real.
//
// Uso (aponte DATABASE_URL para o banco desejado):
//   npx tsx scripts/cleanup-seed.ts            → dry-run (só mostra o que faria)
//   npx tsx scripts/cleanup-seed.ts --apply    → executa de verdade
try {
  process.loadEnvFile(".env");
} catch {
  // env já presente no ambiente
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FAKE_SELLER_SLUGS = ["loja-maker-sp", "mundo-3d", "megastore"];
const DEMO_PRODUCT_SLUGS = [
  "resina-voolt-standard-cinza-1l",
  "resina-printalot-tough-transparente-500g",
];

async function main() {
  const apply = process.argv.includes("--apply");

  // 1) Lojas fictícias — trava de segurança: só as que apontam para example.com.br.
  const sellers = await prisma.seller.findMany({
    where: {
      slug: { in: FAKE_SELLER_SLUGS },
      website: { contains: "example.com.br" },
    },
    select: { id: true, slug: true, name: true },
  });
  const sellerIds = sellers.map((s) => s.id);

  const offers = await prisma.offer.findMany({
    where: { sellerId: { in: sellerIds } },
    select: { id: true },
  });
  const offerIds = offers.map((o) => o.id);

  const [clicks, snaps, leads, rules, sources] = await Promise.all([
    prisma.clickEvent.count({ where: { offerId: { in: offerIds } } }),
    prisma.priceSnapshot.count({ where: { offerId: { in: offerIds } } }),
    prisma.lead.count({ where: { offerId: { in: offerIds } } }),
    prisma.shippingRule.count({ where: { sellerId: { in: sellerIds } } }),
    prisma.source.count({ where: { sellerId: { in: sellerIds } } }),
  ]);

  console.log(
    `Lojas fictícias: ${sellers.map((s) => s.slug).join(", ") || "nenhuma encontrada"}`,
  );
  console.log(
    `  ofertas: ${offerIds.length} | snapshots: ${snaps} | cliques: ${clicks} | leads a desvincular: ${leads} | regras de frete: ${rules} | fontes: ${sources}`,
  );

  // 2) Produtos demo — só removem se ficarem sem nenhuma oferta real.
  const products = await prisma.product.findMany({
    where: { slug: { in: DEMO_PRODUCT_SLUGS } },
    select: { id: true, slug: true },
  });
  for (const p of products) {
    const realOffers = await prisma.offer.count({
      where: { productId: p.id, sellerId: { notIn: sellerIds } },
    });
    console.log(
      `Produto demo "${p.slug}": ofertas reais = ${realOffers} ${realOffers > 0 ? "→ NÃO será removido" : "→ será removido"}`,
    );
  }

  if (!apply) {
    console.log("\nDry-run (nada foi alterado). Rode com --apply para executar.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.lead.updateMany({
      where: { offerId: { in: offerIds } },
      data: { offerId: null },
    });
    await tx.clickEvent.deleteMany({ where: { offerId: { in: offerIds } } });
    await tx.priceSnapshot.deleteMany({ where: { offerId: { in: offerIds } } });
    await tx.offer.deleteMany({ where: { id: { in: offerIds } } });
    await tx.shippingRule.deleteMany({ where: { sellerId: { in: sellerIds } } });
    await tx.source.deleteMany({ where: { sellerId: { in: sellerIds } } });
    await tx.seller.deleteMany({ where: { id: { in: sellerIds } } });

    for (const p of products) {
      const remaining = await tx.offer.count({ where: { productId: p.id } });
      if (remaining === 0) {
        await tx.review.deleteMany({ where: { productId: p.id } });
        await tx.product.delete({ where: { id: p.id } });
        console.log(`Removido produto demo: ${p.slug}`);
      } else {
        console.log(`Mantido (tem ofertas reais): ${p.slug}`);
      }
    }
  });

  console.log(
    "\nLimpeza aplicada. As páginas públicas atualizam quando o ISR revalidar (até 1h) ou no próximo deploy.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
