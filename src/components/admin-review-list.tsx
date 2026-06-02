import { Check, Trash2, X } from "lucide-react";

import {
  approveReview,
  deleteReview,
  rejectReview,
} from "@/app/admin/avaliacoes/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  status: string;
  context: string;
};

function statusBadge(status: string) {
  if (status === "APPROVED")
    return (
      <Badge variant="success" className="shrink-0">
        publicada
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge variant="outline" className="shrink-0 text-amber-600">
        pendente
      </Badge>
    );
  return (
    <Badge variant="outline" className="shrink-0 text-muted-foreground">
      rejeitada
    </Badge>
  );
}

/** Lista de avaliações com moderação (aprovar / rejeitar / apagar). Para o
 *  admin global e por marca. */
export function AdminReviewList({ reviews }: { reviews: AdminReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nenhuma avaliação por aqui.
      </div>
    );
  }

  return (
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
              {statusBadge(r.status)}
            </div>
            {r.context ? (
              <p className="text-xs text-muted-foreground">{r.context}</p>
            ) : null}
            {r.title ? <p className="mt-1 font-medium">{r.title}</p> : null}
            <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {r.status !== "APPROVED" ? (
              <form action={approveReview}>
                <input type="hidden" name="reviewId" value={r.id} />
                <Button size="sm" type="submit">
                  <Check />
                  Aprovar
                </Button>
              </form>
            ) : null}
            {r.status !== "REJECTED" ? (
              <form action={rejectReview}>
                <input type="hidden" name="reviewId" value={r.id} />
                <Button size="sm" variant="outline" type="submit">
                  <X />
                  Rejeitar
                </Button>
              </form>
            ) : null}
            <form action={deleteReview}>
              <input type="hidden" name="reviewId" value={r.id} />
              <ConfirmSubmitButton
                confirmText="Apagar esta avaliação definitivamente?"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 />
                Apagar
              </ConfirmSubmitButton>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
