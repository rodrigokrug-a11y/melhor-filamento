import { Trophy } from "lucide-react";

import { cancelBoost, placeBoost } from "@/app/painel/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

const PLACEMENTS = [
  { key: "TOP_FILAMENT", label: "Topo de Filamentos" },
  { key: "TOP_RESIN", label: "Topo de Resinas" },
  { key: "TOP_PRINTER", label: "Topo de Impressoras" },
];

export type BoostRow = {
  id: string;
  placement: string;
  bidAmount: number;
  status: string;
};

const inputClass =
  "h-9 w-28 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge variant="success">ativo</Badge>;
  if (status === "PENDING")
    return (
      <Badge variant="outline" className="text-amber-600">
        aguardando
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status === "REJECTED" ? "recusado" : status.toLowerCase()}
    </Badge>
  );
}

/** Leilão de destaque: a loja dá um lance mensal por um slot de topo. O maior
 *  lance ativo aparece primeiro na listagem com selo "Patrocinado". */
export function SellerBoosts({
  myBoosts,
  topBids,
}: {
  myBoosts: BoostRow[];
  topBids: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PLACEMENTS.map((p) => {
        const mine = myBoosts.find((b) => b.placement === p.key);
        const top = topBids[p.key] ?? 0;
        const winning =
          mine != null && mine.status === "ACTIVE" && mine.bidAmount >= top;
        return (
          <div key={p.key} className="flex flex-col rounded-xl border bg-card p-4">
            <p className="font-medium">{p.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Maior lance ativo: {top > 0 ? `${formatBRL(top)}/mês` : "—"}
            </p>
            {mine ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                <span>
                  Seu lance: <strong>{formatBRL(mine.bidAmount)}</strong>
                </span>
                {statusBadge(mine.status)}
                {winning ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Trophy className="size-3.5" /> no topo
                  </span>
                ) : null}
              </div>
            ) : null}
            <form action={placeBoost} className="mt-3 flex gap-2">
              <input type="hidden" name="placement" value={p.key} />
              <input
                name="bid"
                inputMode="decimal"
                placeholder="R$/mês"
                defaultValue={mine ? mine.bidAmount.toFixed(2) : ""}
                className={inputClass}
              />
              <Button size="sm" type="submit">
                {mine ? "Atualizar" : "Dar lance"}
              </Button>
            </form>
            {mine ? (
              <form action={cancelBoost} className="mt-1">
                <input type="hidden" name="boostId" value={mine.id} />
                <button
                  type="submit"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  cancelar lance
                </button>
              </form>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
