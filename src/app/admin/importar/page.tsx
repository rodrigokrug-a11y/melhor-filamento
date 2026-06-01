import { ImportForm } from "@/components/import-form";
import { prisma } from "@/lib/db";

export default async function ImportarPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold">Importar oferta de um link</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Cole a URL de um produto de uma loja. O sistema lê os dados estruturados
        da página (JSON-LD / OpenGraph), casa com um produto do catálogo e cria a
        oferta em análise.
      </p>
      <ImportForm sellers={sellers} />
    </div>
  );
}
