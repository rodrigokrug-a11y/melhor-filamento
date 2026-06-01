import type { Metadata } from "next";
import { Tag } from "lucide-react";

import { auth } from "@/auth";
import { OfferForm } from "@/components/offer-form";
import { PageHeader } from "@/components/page-header";
import { isAdminEmail } from "@/lib/admin-emails";
import { materialLabel } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cadastrar oferta",
  robots: { index: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CadastrarOfertaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const defaultProductId =
    typeof sp.productId === "string" ? sp.productId : "";
  const session = await auth();
  const isAdmin = isAdminEmail(session?.user?.email);

  const [products, sellers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, material: true },
    }),
    prisma.seller.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  const options = products.map((p) => ({
    id: p.id,
    label: `${p.name} (${materialLabel(p.material)})`,
  }));
  const stores = sellers.map((s) => s.name);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <PageHeader
        icon={Tag}
        eyebrow="Comunidade"
        title="Cadastrar oferta"
        subtitle={
          isAdmin
            ? "Como admin, a oferta é publicada na hora."
            : "Achou um preço melhor? Cadastre a oferta — ela entra em análise antes de aparecer no comparador."
        }
      />
      <OfferForm
        products={options}
        stores={stores}
        loggedIn={!!session?.user}
        defaultName={session?.user?.name ?? ""}
        defaultProductId={defaultProductId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
