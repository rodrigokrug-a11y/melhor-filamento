import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { CreateLojaForm } from "@/components/create-loja-form";
import { OfferStatusBadge } from "@/components/offer-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";
import { cn, formatBRL } from "@/lib/utils";

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

  const offers = await prisma.offer.findMany({
    where: { sellerId: seller.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{seller.name}</h1>
          <p className="text-sm text-muted-foreground">
            {offers.length} {offers.length === 1 ? "oferta" : "ofertas"}
            {seller.isVerified ? " · loja verificada" : ""}
          </p>
        </div>
        <Link href="/cadastrar-oferta" className={cn(buttonVariants())}>
          <Plus />
          Cadastrar oferta
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Você ainda não cadastrou ofertas. Clique em “Cadastrar oferta” para
          publicar a primeira.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{offer.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {materialLabel(offer.product.material)} ·{" "}
                  {formatBRL(Number(offer.price))}
                  {offer.couponCode ? ` · cupom ${offer.couponCode}` : ""}
                </p>
              </div>
              <OfferStatusBadge status={offer.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
