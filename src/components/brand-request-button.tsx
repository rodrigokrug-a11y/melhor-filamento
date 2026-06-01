"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Megaphone } from "lucide-react";

import { createOfferRequest, type RequestState } from "@/app/marca/[slug]/actions";
import { Button } from "@/components/ui/button";

export function BrandRequestButton({
  brandId,
  brandName,
}: {
  brandId: string;
  brandName: string;
}) {
  const [state, action, pending] = useActionState<RequestState, FormData>(
    createOfferRequest,
    {},
  );

  if (state.ok) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        Pedido registrado! Vamos buscar ofertas da {brandName} pra você.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="brandId" value={brandId} />
      <input
        name="email"
        type="email"
        placeholder="seu e-mail (opcional — pra te avisar)"
        className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
      />
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Megaphone className="size-4" />
        )}
        Pedir ofertas
      </Button>
      {state.error ? (
        <span className="text-sm text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
