import { approveReview, rejectReview } from "@/app/admin/avaliacoes/actions";
import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { getPendingReviews } from "@/lib/reviews";

export default async function ModerarAvaliacoesPage() {
  const pending = await getPendingReviews();
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Avaliações pendentes</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada pendente. 🎉</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.authorName}</span>
                <Stars value={r.rating} size={14} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.product?.name ?? r.brand?.name ?? "—"}
              </p>
              {r.title ? <p className="mt-1 font-medium">{r.title}</p> : null}
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              <div className="mt-3 flex gap-2">
                <form action={approveReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button type="submit" size="sm">
                    Aprovar
                  </Button>
                </form>
                <form action={rejectReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button type="submit" size="sm" variant="outline">
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
