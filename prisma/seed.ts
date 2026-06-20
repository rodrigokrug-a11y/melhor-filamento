import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

// Carrega .env quando o seed é rodado fora do Prisma CLI (ex.: tsx direto).
try {
  process.loadEnvFile(".env");
} catch {
  // env já presente no ambiente
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DIA = 24 * 60 * 60 * 1000;

const brandData = [
  { name: "3D Fila", slug: "3d-fila", logoUrl: null },
  { name: "Voolt", slug: "voolt", logoUrl: null },
  { name: "PrintaLot", slug: "printalot", logoUrl: null },
];

type ProductSeed = {
  slug: string;
  name: string;
  kind: "FILAMENT" | "RESIN";
  material:
    | "PLA"
    | "ABS"
    | "PETG"
    | "TPU"
    | "ASA"
    | "RESIN_STANDARD"
    | "RESIN_TOUGH"
    | "RESIN_WATER_WASHABLE";
  diameterMm: number | null;
  netWeightG: number;
  color: string;
  brandSlug: string;
  specs: Prisma.InputJsonValue;
};

const productData: ProductSeed[] = [
  {
    slug: "filamento-pla-3d-fila-preto-1kg-175mm",
    name: "Filamento PLA 3D Fila Preto 1kg (1,75mm)",
    kind: "FILAMENT",
    material: "PLA",
    diameterMm: 1.75,
    netWeightG: 1000,
    color: "Preto",
    brandSlug: "3d-fila",
    specs: { tempBicoC: "190-220", tempMesaC: "50-60" },
  },
  {
    slug: "filamento-pla-3d-fila-branco-1kg-175mm",
    name: "Filamento PLA 3D Fila Branco 1kg (1,75mm)",
    kind: "FILAMENT",
    material: "PLA",
    diameterMm: 1.75,
    netWeightG: 1000,
    color: "Branco",
    brandSlug: "3d-fila",
    specs: { tempBicoC: "190-220", tempMesaC: "50-60" },
  },
  {
    slug: "filamento-petg-voolt-preto-1kg-175mm",
    name: "Filamento PETG Voolt Preto 1kg (1,75mm)",
    kind: "FILAMENT",
    material: "PETG",
    diameterMm: 1.75,
    netWeightG: 1000,
    color: "Preto",
    brandSlug: "voolt",
    specs: { tempBicoC: "230-250", tempMesaC: "70-80" },
  },
  {
    slug: "filamento-abs-printalot-cinza-1kg-175mm",
    name: "Filamento ABS PrintaLot Cinza 1kg (1,75mm)",
    kind: "FILAMENT",
    material: "ABS",
    diameterMm: 1.75,
    netWeightG: 1000,
    color: "Cinza",
    brandSlug: "printalot",
    specs: { tempBicoC: "230-250", tempMesaC: "90-110" },
  },
  {
    slug: "filamento-tpu-voolt-preto-500g-175mm",
    name: "Filamento TPU Flexível Voolt Preto 500g (1,75mm)",
    kind: "FILAMENT",
    material: "TPU",
    diameterMm: 1.75,
    netWeightG: 500,
    color: "Preto",
    brandSlug: "voolt",
    specs: { durezaShoreA: "95", tempBicoC: "210-230" },
  },
  {
    slug: "filamento-asa-3d-fila-natural-1kg-175mm",
    name: "Filamento ASA 3D Fila Natural 1kg (1,75mm)",
    kind: "FILAMENT",
    material: "ASA",
    diameterMm: 1.75,
    netWeightG: 1000,
    color: "Natural",
    brandSlug: "3d-fila",
    specs: { tempBicoC: "240-260", tempMesaC: "90-110" },
  },
  {
    slug: "filamento-pla-3d-fila-vermelho-1kg-285mm",
    name: "Filamento PLA 3D Fila Vermelho 1kg (2,85mm)",
    kind: "FILAMENT",
    material: "PLA",
    diameterMm: 2.85,
    netWeightG: 1000,
    color: "Vermelho",
    brandSlug: "3d-fila",
    specs: { tempBicoC: "190-220", tempMesaC: "50-60" },
  },
  {
    slug: "resina-voolt-standard-cinza-1l",
    name: "Resina Voolt Standard Cinza 1L",
    kind: "RESIN",
    material: "RESIN_STANDARD",
    diameterMm: null,
    netWeightG: 1000,
    color: "Cinza",
    brandSlug: "voolt",
    specs: { tecnologia: "LCD/DLP", comprimentoOndaNm: "405" },
  },
  {
    slug: "resina-printalot-tough-transparente-500g",
    name: "Resina PrintaLot Tough Transparente 500g",
    kind: "RESIN",
    material: "RESIN_TOUGH",
    diameterMm: null,
    netWeightG: 500,
    color: "Transparente",
    brandSlug: "printalot",
    specs: { tecnologia: "LCD/DLP", comprimentoOndaNm: "405" },
  },
  {
    slug: "resina-3d-fila-water-washable-branca-1l",
    name: "Resina 3D Fila Water Washable Branca 1L",
    kind: "RESIN",
    material: "RESIN_WATER_WASHABLE",
    diameterMm: null,
    netWeightG: 1000,
    color: "Branco",
    brandSlug: "3d-fila",
    specs: { tecnologia: "LCD/DLP", lavavelEmAgua: "sim" },
  },
];

const sellerData = [
  {
    name: "3D Fila Oficial",
    slug: "3d-fila-oficial",
    type: "FACTORY" as const,
    website: "https://www.3dfila.com.br",
    isVerified: true,
  },
  {
    name: "Loja Maker SP",
    slug: "loja-maker-sp",
    type: "RESELLER" as const,
    website: "https://lojamaker.example.com.br",
    isVerified: true,
  },
  {
    name: "Mundo 3D",
    slug: "mundo-3d",
    type: "RESELLER" as const,
    website: "https://mundo3d.example.com.br",
    isVerified: false,
  },
  {
    name: "MegaStore",
    slug: "megastore",
    type: "MARKETPLACE" as const,
    website: "https://megastore.example.com.br",
    isVerified: false,
  },
];

async function main() {
  // Limpa dados transacionais (respeitando FKs).
  await prisma.clickEvent.deleteMany();
  await prisma.priceSnapshot.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.shippingRule.deleteMany();

  // Marcas
  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const rec = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logoUrl: b.logoUrl },
      create: b,
    });
    brands[b.slug] = rec.id;
  }

  // Produtos
  const products: Record<string, string> = {};
  for (const p of productData) {
    const { brandSlug, ...rest } = p;
    const data = { ...rest, brandId: brands[brandSlug] };
    const rec = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    products[p.slug] = rec.id;
  }

  // Vendedores
  const sellers: Record<string, string> = {};
  for (const s of sellerData) {
    const rec = await prisma.seller.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    sellers[s.slug] = rec.id;
  }

  // Regras de frete (UF > REGION > NATIONAL na resolução)
  await prisma.shippingRule.createMany({
    data: [
      { sellerId: sellers["3d-fila-oficial"], scope: "NATIONAL", baseCost: "25.00", freeShippingThreshold: "300.00", estimatedDays: 5 },
      { sellerId: sellers["3d-fila-oficial"], scope: "REGION", region: "SE", baseCost: "15.00", freeShippingThreshold: "200.00", estimatedDays: 3 },
      { sellerId: sellers["3d-fila-oficial"], scope: "UF", uf: "SP", baseCost: "10.00", freeShippingThreshold: "150.00", estimatedDays: 2 },

      { sellerId: sellers["loja-maker-sp"], scope: "UF", uf: "SP", baseCost: "0.00", estimatedDays: 1 },
      { sellerId: sellers["loja-maker-sp"], scope: "REGION", region: "SE", baseCost: "12.00", freeShippingThreshold: "250.00", estimatedDays: 2 },
      { sellerId: sellers["loja-maker-sp"], scope: "NATIONAL", baseCost: "30.00", freeShippingThreshold: "250.00", estimatedDays: 6 },

      { sellerId: sellers["mundo-3d"], scope: "NATIONAL", baseCost: "20.00", freeShippingThreshold: "200.00", estimatedDays: 4 },
      { sellerId: sellers["mundo-3d"], scope: "REGION", region: "S", baseCost: "14.00", freeShippingThreshold: "180.00", estimatedDays: 3 },

      { sellerId: sellers["megastore"], scope: "NATIONAL", baseCost: "18.00", freeShippingThreshold: "199.00", estimatedDays: 6 },
    ],
  });

  const sponsoredUntil = new Date(Date.now() + 30 * DIA);
  const url = (sellerSlug: string, productSlug: string) =>
    `${sellerData.find((s) => s.slug === sellerSlug)!.website}/produto/${productSlug}`;

  // Ofertas (APPROVED + em estoque entram no comparativo; demais testam os filtros)
  await prisma.offer.createMany({
    data: [
      // PLA preto 3D Fila — 3 ofertas, uma patrocinada e uma com cupom
      { productId: products["filamento-pla-3d-fila-preto-1kg-175mm"], sellerId: sellers["3d-fila-oficial"], price: "109.90", url: url("3d-fila-oficial", "filamento-pla-3d-fila-preto-1kg-175mm"), stockStatus: "IN_STOCK", isSponsored: true, sponsoredUntil, status: "APPROVED" },
      { productId: products["filamento-pla-3d-fila-preto-1kg-175mm"], sellerId: sellers["mundo-3d"], price: "99.90", url: url("mundo-3d", "filamento-pla-3d-fila-preto-1kg-175mm"), couponCode: "MUNDO10", couponType: "PERCENT", couponDiscount: "10.00", stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["filamento-pla-3d-fila-preto-1kg-175mm"], sellerId: sellers["megastore"], price: "119.90", url: url("megastore", "filamento-pla-3d-fila-preto-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // PLA branco 3D Fila — cupom fixo
      { productId: products["filamento-pla-3d-fila-branco-1kg-175mm"], sellerId: sellers["3d-fila-oficial"], price: "109.90", url: url("3d-fila-oficial", "filamento-pla-3d-fila-branco-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["filamento-pla-3d-fila-branco-1kg-175mm"], sellerId: sellers["loja-maker-sp"], price: "105.00", url: url("loja-maker-sp", "filamento-pla-3d-fila-branco-1kg-175mm"), couponCode: "MAKER5", couponType: "FIXED", couponDiscount: "5.00", stockStatus: "IN_STOCK", status: "APPROVED" },

      // PETG Voolt — uma fora de estoque (não deve aparecer)
      { productId: products["filamento-petg-voolt-preto-1kg-175mm"], sellerId: sellers["loja-maker-sp"], price: "129.90", url: url("loja-maker-sp", "filamento-petg-voolt-preto-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["filamento-petg-voolt-preto-1kg-175mm"], sellerId: sellers["mundo-3d"], price: "134.90", url: url("mundo-3d", "filamento-petg-voolt-preto-1kg-175mm"), stockStatus: "OUT_OF_STOCK", status: "APPROVED" },

      // ABS PrintaLot
      { productId: products["filamento-abs-printalot-cinza-1kg-175mm"], sellerId: sellers["megastore"], price: "89.90", url: url("megastore", "filamento-abs-printalot-cinza-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["filamento-abs-printalot-cinza-1kg-175mm"], sellerId: sellers["mundo-3d"], price: "94.90", url: url("mundo-3d", "filamento-abs-printalot-cinza-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // TPU Voolt
      { productId: products["filamento-tpu-voolt-preto-500g-175mm"], sellerId: sellers["loja-maker-sp"], price: "119.90", url: url("loja-maker-sp", "filamento-tpu-voolt-preto-500g-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // ASA 3D Fila
      { productId: products["filamento-asa-3d-fila-natural-1kg-175mm"], sellerId: sellers["3d-fila-oficial"], price: "139.90", url: url("3d-fila-oficial", "filamento-asa-3d-fila-natural-1kg-175mm"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // PLA 2,85mm 3D Fila
      { productId: products["filamento-pla-3d-fila-vermelho-1kg-285mm"], sellerId: sellers["3d-fila-oficial"], price: "119.90", url: url("3d-fila-oficial", "filamento-pla-3d-fila-vermelho-1kg-285mm"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // Resina Voolt Standard — cupom percentual
      { productId: products["resina-voolt-standard-cinza-1l"], sellerId: sellers["mundo-3d"], price: "159.90", url: url("mundo-3d", "resina-voolt-standard-cinza-1l"), couponCode: "RESINA15", couponType: "PERCENT", couponDiscount: "15.00", stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["resina-voolt-standard-cinza-1l"], sellerId: sellers["megastore"], price: "149.90", url: url("megastore", "resina-voolt-standard-cinza-1l"), stockStatus: "IN_STOCK", status: "APPROVED" },

      // Resina PrintaLot Tough — uma PENDING (não deve aparecer)
      { productId: products["resina-printalot-tough-transparente-500g"], sellerId: sellers["megastore"], price: "99.90", url: url("megastore", "resina-printalot-tough-transparente-500g"), stockStatus: "IN_STOCK", status: "APPROVED" },
      { productId: products["resina-printalot-tough-transparente-500g"], sellerId: sellers["loja-maker-sp"], price: "109.90", url: url("loja-maker-sp", "resina-printalot-tough-transparente-500g"), stockStatus: "IN_STOCK", status: "PENDING" },

      // Resina Water Washable 3D Fila
      { productId: products["resina-3d-fila-water-washable-branca-1l"], sellerId: sellers["3d-fila-oficial"], price: "169.90", url: url("3d-fila-oficial", "resina-3d-fila-water-washable-branca-1l"), stockStatus: "IN_STOCK", status: "APPROVED" },
    ],
  });

  const [brandCount, productCount, sellerCount, offerCount, ruleCount] =
    await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.seller.count(),
      prisma.offer.count(),
      prisma.shippingRule.count(),
    ]);

  console.log(
    `Seed concluído: ${brandCount} marcas, ${productCount} produtos, ${sellerCount} vendedores, ${offerCount} ofertas, ${ruleCount} regras de frete.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
