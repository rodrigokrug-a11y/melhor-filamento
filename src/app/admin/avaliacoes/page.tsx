import { Check, X } from "lucide-react";

import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { getPendingReviews } from "@/lib/reviews";

import { approveReview, rejectReview } from "./actions";

export default async function AvaliacoesPage() {
  const reviews = await getPendingReviews();

  return (
    <div>
      <h2 className="text-lg font-semibold">Moderação de avaliações</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Avaliações aguardando aprovação. As aprovadas entram no ranking e nas
        páginas.
      </p>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma avaliação pendente.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.authorName}</span>
                  <Stars value={r.rating} size={14} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.product
                    ? `Modelo: ${r.product.name}`
                    : r.brand
                      ? `Marca: ${r.brand.name}`
                      : ""}
                </p>
                {r.title ? <p className="mt-1 font-medium">{r.title}</p> : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.comment}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={approveReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button size="sm" type="submit">
                    <Check />
                    Aprovar
                  </Button>
                </form>
                <form action={rejectReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
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
