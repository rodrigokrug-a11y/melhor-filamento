import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";
import { getPendingTips } from "@/lib/tips";

import { approveTip, rejectTip } from "./actions";

export default async function DicasPage() {
  const tips = await getPendingTips();

  return (
    <div>
      <h2 className="text-lg font-semibold">Moderação de dicas</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Dicas aguardando aprovação. As aprovadas aparecem nas páginas de cada
        tipo de filamento.
      </p>

      {tips.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma dica pendente.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {tips.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                    {materialLabel(t.material)}
                  </span>
                  <span>{t.authorName}</span>
                  {t.product ? <span>· {t.product.name}</span> : null}
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm">{t.notes}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  {t.nozzleTempC != null ? (
                    <span>Bico {t.nozzleTempC} °C</span>
                  ) : null}
                  {t.bedTempC != null ? (
                    <span>Mesa {t.bedTempC} °C</span>
                  ) : null}
                  {t.speedMms != null ? (
                    <span>{t.speedMms} mm/s</span>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={approveTip}>
                  <input type="hidden" name="tipId" value={t.id} />
                  <Button size="sm" type="submit">
                    <Check />
                    Aprovar
                  </Button>
                </form>
                <form action={rejectTip}>
                  <input type="hidden" name="tipId" value={t.id} />
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
