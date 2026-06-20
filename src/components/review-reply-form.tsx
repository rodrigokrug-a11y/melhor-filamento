"use client";

import { useActionState } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { replyToReview } from "@/lib/review-reply-actions";

export function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(replyToReview, {});

  if (state.ok) {
    return (
      <p className="mt-2 text-xs font-medium text-brand">
        Resposta enviada. Recarregue a página para vê-la.
      </p>
    );
  }

  return (
    <form action={action} className="mt-2 space-y-1.5">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="body"
        required
        maxLength={1000}
        rows={2}
        placeholder="Responder como loja…"
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          <MessageSquare className="size-3.5" />
          {pending ? "Enviando…" : "Responder como loja"}
        </Button>
        {state.error ? (
          <span className="text-xs text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
