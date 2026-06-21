import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";

import { OffersTable } from "@/components/offers-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

import {
  grantSellerAccess,
  revokeSellerAccess,
  setSellerAffiliate,
} from "../actions";

export const metadata: Metadata = { title: "Loja", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function AdminLojaDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const seller = await prisma.seller.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      website: true,
      isVerified: true,
      affiliateParams: true,
      affiliateTemplate: true,
      owner: { select: { email: true, name: true } },
    },
  });
  if (!seller) notFound();

  const offers = await prisma.offer.findMany({
    where: { sellerId: id },
    include: {
      product: { select: { name: true } },
      seller: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const offerRows = offers.map((o) => ({
    id: o.id,
    productName: o.product.name,
    sellerName: o.seller.name,
    price: Number(o.price),
    status: o.status,
    isSponsored: o.isSponsored,
  }));

  return (
    <div>
      <Link
        href="/admin/lojas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Lojas
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{seller.name}</h2>
          {seller.isVerified ? (
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="size-3" />
              verificada
            </Badge>
          ) : null}
        </div>
        {seller.website ? (
          <a
            href={seller.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {seller.website}
          </a>
        ) : null}
      </div>

      <section className="mb-8 rounded-2xl border bg-card p-4">
        <h3 className="font-semibold">Acesso da loja (autoatendimento)</h3>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Libere para a loja gerenciar os próprios anúncios (preço, foto, link,
          ativar/pausar) em <code>/painel</code>.
        </p>
        {seller.owner ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3">
            <p className="text-sm">
              Dono:{" "}
              <span className="font-medium">{seller.owner.email}</span>
              {seller.owner.name ? ` (${seller.owner.name})` : ""}
            </p>
            <form action={revokeSellerAccess}>
              <input type="hidden" name="sellerId" value={seller.id} />
              <Button size="sm" variant="outline" type="submit">
                Remover acesso
              </Button>
            </form>
          </div>
        ) : (
          <form action={grantSellerAccess} className="flex flex-wrap gap-2">
            <input type="hidden" name="sellerId" value={seller.id} />
            <input
              name="email"
              type="email"
              required
              placeholder="email@loja.com.br"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" type="submit">
              Liberar acesso
            </Button>
          </form>
        )}
      </section>

      <section className="mb-8 rounded-2xl border bg-card p-4">
        <h3 className="font-semibold">Afiliado (monetização)</h3>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Aplicado no link de saída (<code>/go</code>). Cadastre conforme entrar
          no programa da loja — vale na hora, sem deploy.
        </p>
        <form action={setSellerAffiliate} className="space-y-3">
          <input type="hidden" name="sellerId" value={seller.id} />
          <div className="space-y-1">
            <label
              htmlFor="affiliateParams"
              className="text-sm font-medium"
            >
              Parâmetros de afiliado
            </label>
            <input
              id="affiliateParams"
              name="affiliateParams"
              defaultValue={seller.affiliateParams ?? ""}
              placeholder="ref=melhorfilamento&aff=ABC123"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Query anexada ao link da loja (programa próprio dela). Ex.:{" "}
              <code>ref=melhorfilamento</code> ou <code>utm_affiliate=SEU-ID</code>.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="affiliateTemplate"
              className="text-sm font-medium"
            >
              Template de rede (opcional)
            </label>
            <input
              id="affiliateTemplate"
              name="affiliateTemplate"
              defaultValue={seller.affiliateTemplate ?? ""}
              placeholder="https://rede.com/click?u={target}"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Só para redes (Awin/Lomadee): use <code>{"{target}"}</code> no
              lugar do link, que entra embrulhado.
            </p>
          </div>
          <Button size="sm" type="submit">
            Salvar afiliado
          </Button>
        </form>
      </section>

      <section>
        <h3 className="mb-1 font-semibold">Anúncios desta loja</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Edite preço/status/patrocínio na célula ou selecione vários para
          ações em massa e exclusão.
        </p>
        {offerRows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum anúncio desta loja.
          </div>
        ) : (
          <OffersTable offers={offerRows} />
        )}
      </section>
    </div>
  );
}
