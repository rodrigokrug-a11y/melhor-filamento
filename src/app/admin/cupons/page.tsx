import { Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPendingCoupons } from "@/lib/coupons";

import { setCouponStatus } from "./actions";

export default async function CuponsAdminPage() {
  const pending = await getPendingCoupons();

  return (
    <div>
      <h2 className="text-lg font-semibold">Cupons da comunidade</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Cupons enviados pelos usuários. Aprovados aparecem na página do produto
        das lojas correspondentes.
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum cupom pendente. 🎉
        </p>
      ) : (
        <ul className="space-y-3">
          {pending.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand/40 bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold text-brand">
                <Ticket className="size-3.5" />
                {c.code}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.seller.name}</p>
                {c.description ? (
                  <p className="text-xs text-muted-foreground">
                    {c.description}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  por {c.submittedByName ?? c.submittedBy?.email ?? "anônimo"}
                  {c.expiresAt
                    ? ` · até ${c.expiresAt.toLocaleDateString("pt-BR")}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={setCouponStatus}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <Button type="submit" size="sm">
                    Aprovar
                  </Button>
                </form>
                <form action={setCouponStatus}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="REJECTED" />
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
