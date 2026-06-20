import { Store } from "lucide-react";

import { ReviewReplyForm } from "@/components/review-reply-form";
import { Stars } from "@/components/stars";
import type { RatingSummary, ReviewView } from "@/lib/reviews";

export function ReviewList({
  summary,
  reviews,
  canReply = false,
}: {
  summary: RatingSummary;
  reviews: ReviewView[];
  canReply?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">
          {summary.average != null ? summary.average.toFixed(1) : "—"}
        </span>
        <div>
          <Stars value={summary.average ?? 0} />
          <p className="text-xs text-muted-foreground">
            {summary.count} {summary.count === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há avaliações. Seja o primeiro!
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.authorName}</span>
                <Stars value={r.rating} size={14} />
              </div>
              {r.title ? <p className="mt-1 font-medium">{r.title}</p> : null}
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {r.createdAt.toLocaleDateString("pt-BR")}
              </p>

              {r.replies.map((rep, i) => (
                <div
                  key={i}
                  className="mt-3 rounded-lg border-l-2 border-brand bg-brand-soft/40 p-3"
                >
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                    <Store className="size-3.5" />
                    Resposta de {rep.sellerName}
                  </p>
                  <p className="mt-1 text-sm">{rep.body}</p>
                </div>
              ))}

              {canReply ? <ReviewReplyForm reviewId={r.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
