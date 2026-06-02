import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { SellerLocationForm } from "@/components/seller-location-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

import { toggleSellerVerified } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  FACTORY: "Fabricante",
  RESELLER: "Revenda",
  MARKETPLACE: "Marketplace",
};

export default async function LojasPage() {
  const sellers = await prisma.seller.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { offers: true } } },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">Lojas</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Verifique as lojas confiáveis — o selo aparece nas ofertas.
      </p>

      {sellers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma loja cadastrada.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {sellers.map((seller) => (
            <li key={seller.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/lojas/${seller.id}`}
                    className="truncate font-medium underline-offset-2 hover:underline"
                  >
                    {seller.name}
                  </Link>
                  {seller.isVerified ? (
                    <Badge variant="success" className="gap-1">
                      <BadgeCheck className="size-3" />
                      verificada
                    </Badge>
                  ) : null}
                </div>
                <Link
                  href={`/admin/lojas/${seller.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {TYPE_LABELS[seller.type] ?? seller.type} ·{" "}
                  {seller._count.offers} anúncios →
                </Link>
              </div>
              <form action={toggleSellerVerified} className="shrink-0">
                <input type="hidden" name="sellerId" value={seller.id} />
                <input
                  type="hidden"
                  name="verified"
                  value={seller.isVerified ? "false" : "true"}
                />
                <Button
                  size="sm"
                  variant={seller.isVerified ? "outline" : "default"}
                  type="submit"
                >
                  {seller.isVerified ? "Remover selo" : "Verificar"}
                </Button>
              </form>
              </div>
              <SellerLocationForm seller={seller} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
