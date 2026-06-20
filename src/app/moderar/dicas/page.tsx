import { approveTip, rejectTip } from "@/app/admin/dicas/actions";
import { Button } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";
import { getPendingTips } from "@/lib/tips";

export default async function ModerarDicasPage() {
  const pending = await getPendingTips();
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Dicas pendentes</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada pendente. 🎉</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((t) => {
            const specs = [
              t.nozzleTempC ? `bico ${t.nozzleTempC}°C` : null,
              t.bedTempC ? `mesa ${t.bedTempC}°C` : null,
              t.speedMms ? `${t.speedMms} mm/s` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={t.id}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    {materialLabel(t.material)}
                  </span>
                  <span className="text-sm font-medium">{t.authorName}</span>
                  {t.product ? (
                    <span className="text-xs text-muted-foreground">
                      {t.product.name}
                    </span>
                  ) : null}
                </div>
                {specs ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {specs}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">{t.notes}</p>
                <div className="mt-3 flex gap-2">
                  <form action={approveTip}>
                    <input type="hidden" name="tipId" value={t.id} />
                    <Button type="submit" size="sm">
                      Aprovar
                    </Button>
                  </form>
                  <form action={rejectTip}>
                    <input type="hidden" name="tipId" value={t.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Rejeitar
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
