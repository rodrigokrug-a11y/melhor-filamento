import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

import { approveOffer, rejectOffer } from "./actions";

export default async function ModeracaoPage() {
  const pending = await prisma.offer.findMany({
    where: { status: "PENDING" },
    include: { product: true, seller: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">Moderação de ofertas</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Ofertas aguardando aprovação. Aprovadas passam a aparecer no comparador.
      </p>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma oferta pendente.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {pending.map((offer) => (
            <li
              key={offer.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{offer.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {offer.seller.name} · {materialLabel(offer.product.material)} ·{" "}
                  {formatBRL(Number(offer.price))}
                  {offer.couponCode ? ` · cupom ${offer.couponCode}` : ""}
                </p>
                <a
                  href={offer.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="block truncate text-xs text-primary hover:underline"
                >
                  {offer.url}
                </a>
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={approveOffer}>
                  <input type="hidden" name="offerId" value={offer.id} />
                  <Button size="sm" type="submit">
                    <Check />
                    Aprovar
                  </Button>
                </form>
                <form action={rejectOffer}>
                  <input type="hidden" name="offerId" value={offer.id} />
                  <Button size="sm" variant="outline" type="submit">
                    <X />
                    Rejeitar
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
