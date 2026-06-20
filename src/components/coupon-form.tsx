"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitCoupon } from "@/lib/coupon-actions";
import type { ProductSeller } from "@/lib/coupons";

export function CouponForm({
  sellers,
  isLogged,
}: {
  sellers: ProductSeller[];
  isLogged: boolean;
}) {
  const [state, action, pending] = useActionState(submitCoupon, {});

  if (sellers.length === 0) return null;

  if (!isLogged) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/entrar" className="text-brand underline">
          Entre na sua conta
        </Link>{" "}
        para compartilhar um cupom de uma destas lojas.
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="rounded-xl border border-dashed bg-brand-soft/40 p-3 text-sm text-foreground">
        Valeu! Seu cupom foi enviado e aparece aqui após a moderação. 🎟️
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select
          name="sellerId"
          required
          aria-label="Loja do cupom"
          className="h-9 rounded-lg border bg-background px-2 text-sm"
        >
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          name="code"
          required
          maxLength={40}
          placeholder="Código (ex: PLA10)"
          className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm"
        />
      </div>
      <input
        name="description"
        maxLength={200}
        placeholder="O que o cupom dá? (opcional)"
        className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground" htmlFor="cupom-validade">
          Validade (opcional)
        </label>
        <input
          id="cupom-validade"
          type="date"
          name="expiresAt"
          className="h-9 rounded-lg border bg-background px-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          <Ticket className="size-4" />
          {pending ? "Enviando…" : "Compartilhar cupom"}
        </Button>
      </div>
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
