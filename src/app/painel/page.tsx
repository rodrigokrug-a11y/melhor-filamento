import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { CreateLojaForm } from "@/components/create-loja-form";
import { SellerBanners } from "@/components/seller-banners";
import { SellerBoosts } from "@/components/seller-boosts";
import { SellerOffers } from "@/components/seller-offers";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false },
};

export default async function PainelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar");

  // Admin não é vendedor: vai direto para o painel administrativo.
  if (isAdminEmail(session.user.email)) redirect("/admin");

  const seller = await prisma.seller.findUnique({
    where: { ownerUserId: session.user.id },
  });

  if (!seller) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight">Crie sua loja</h1>
        <p className="mb-6 mt-1 text-muted-foreground">
          Cadastre sua loja para começar a publicar ofertas no comparador.
        </p>
        <CreateLojaForm />
      </div>
    );
  }

  const [offers, myBoosts, topAgg, myBanners] = await Promise.all([
    prisma.offer.findMany({
      where: { sellerId: seller.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.boost.findMany({ where: { sellerId: seller.id } }),
    prisma.boost.groupBy({
      by: ["placement"],
      where: { status: "ACTIVE" },
      _max: { bidAmount: true },
    }),
    prisma.banner.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const topBids: Record<string, number> = {};
  for (const t of topAgg) topBids[t.placement] = Number(t._max.bidAmount ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{seller.name}</h1>
          <p className="text-sm text-muted-foreground">
            {offers.length} {offers.length === 1 ? "anúncio" : "anúncios"}
            {seller.isVerified ? " · loja verificada" : ""}
          </p>
        </div>
        <Link href="/cadastrar-oferta" className={cn(buttonVariants())}>
          <Plus />
          Cadastrar oferta
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Seus anúncios</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Edite preço, link, cupom e foto, e ative ou pause cada um.
        </p>
        {offers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            Você ainda não cadastrou anúncios. Clique em “Cadastrar oferta” para
            publicar o primeiro.
          </div>
        ) : (
          <SellerOffers
            offers={offers.map((o) => ({
              id: o.id,
              productName: o.product.name,
              productMaterial: o.product.material,
              productImageUrl: o.product.imageUrl,
              price: Number(o.price),
              url: o.url,
              couponCode: o.couponCode,
              imageUrl: o.imageUrl,
              status: o.status,
            }))}
          />
        )}
      </section>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-lg font-semibold">Destaque (leilão)</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Dê um lance mensal para aparecer no <strong>topo da listagem</strong>{" "}
          com selo “Patrocinado”. O maior lance ativo vence. A ativação é
          confirmada pelo nosso time após o pagamento.
        </p>
        <SellerBoosts
          myBoosts={myBoosts.map((b) => ({
            id: b.id,
            placement: b.placement,
            bidAmount: Number(b.bidAmount),
            status: b.status,
          }))}
          topBids={topBids}
        />
      </section>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-lg font-semibold">Banners</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Anuncie na <strong>home</strong> (banner grande) ou em{" "}
          <strong>todas as páginas</strong> (faixa). Envie o banner e dê um
          lance — o maior lance ativo aparece. Aprovação pelo nosso time.
        </p>
        <SellerBanners
          myBanners={myBanners.map((b) => ({
            id: b.id,
            placement: b.placement,
            title: b.title,
            status: b.status,
            bidAmount: Number(b.bidAmount),
          }))}
        />
      </section>
    </div>
  );
}
