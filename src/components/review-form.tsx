"use client";

import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/review-actions";
import { cn } from "@/lib/utils";

const initialState: { error?: string; ok?: boolean } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ReviewForm({
  productId,
  brandId,
  targetLabel,
}: {
  productId?: string;
  brandId?: string;
  targetLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitReview,
    initialState,
  );
  const [rating, setRating] = useState(5);

  if (state.ok) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-emerald-700">
        Obrigado! Sua avaliação foi enviada e aparece após a moderação.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <p className="text-sm font-medium">Avaliar {targetLabel}</p>
      {productId ? (
        <input type="hidden" name="productId" value={productId} />
      ) : null}
      {brandId ? <input type="hidden" name="brandId" value={brandId} /> : null}
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} ${n > 1 ? "estrelas" : "estrela"}`}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-6",
                n <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>

      <input
        name="title"
        placeholder="Título (opcional)"
        aria-label="Título"
        className={inputClass}
      />
      <textarea
        name="comment"
        required
        rows={3}
        placeholder="Conte sua experiência com esse filamento…"
        aria-label="Comentário"
        className={cn(inputClass, "h-auto py-2")}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="authorName"
          required
          placeholder="Seu nome"
          autoComplete="name"
          aria-label="Seu nome"
          className={inputClass}
        />
        <input
          name="authorEmail"
          type="email"
          placeholder="E-mail (opcional)"
          autoComplete="email"
          aria-label="E-mail"
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Enviar avaliação
      </Button>
    </form>
  );
}
