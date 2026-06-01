import { Megaphone, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { isSponsoredActive } from "@/lib/pricing";
import { formatBRL } from "@/lib/utils";

import { sponsorOffer, unsponsorOffer } from "./actions";

export default async function PatrociniosPage() {
  const offers = await prisma.offer.findMany({
    where: { status: "APPROVED" },
    include: { product: true, seller: true },
    orderBy: [{ isSponsored: "desc" }, { createdAt: "desc" }],
  });
  const now = new Date();

  return (
    <div>
      <h2 className="text-lg font-semibold">Patrocínios</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Ofertas aprovadas. As patrocinadas ganham um slot fixo no topo do
        comparativo, sempre marcadas como “Patrocinado”.
      </p>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma oferta aprovada ainda.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {offers.map((offer) => {
            const active = isSponsoredActive(
              offer.isSponsored,
              offer.sponsoredUntil,
              now,
            );
            return (
              <li
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{offer.product.name}</p>
                    {active ? (
                      <Badge className="gap-1">
                        <Megaphone className="size-3" />
                        Patrocinado
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {offer.seller.name} · {formatBRL(Number(offer.price))}
                    {active && offer.sponsoredUntil
                      ? ` · até ${offer.sponsoredUntil.toLocaleDateString("pt-BR")}`
                      : ""}
                  </p>
                </div>
                <div className="shrink-0">
                  {active ? (
                    <form action={unsponsorOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <Button size="sm" variant="outline" type="submit">
                        <X />
                        Remover
                      </Button>
                    </form>
                  ) : (
                    <form action={sponsorOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <Button size="sm" type="submit">
                        <Megaphone />
                        Patrocinar 30 dias
                      </Button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
