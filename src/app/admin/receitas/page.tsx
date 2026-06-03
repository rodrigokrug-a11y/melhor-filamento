import type { Metadata } from "next";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPendingRecipes } from "@/lib/recipes";

import { setRecipeStatus } from "./actions";

export const metadata: Metadata = {
  title: "Receitas",
  robots: { index: false },
};

export default async function AdminReceitasPage() {
  const recipes = await getPendingRecipes();

  return (
    <div>
      <h2 className="text-lg font-semibold">Moderação de receitas</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Perfis de fatiador aguardando aprovação. As aprovadas aparecem em{" "}
        /receitas.
      </p>

      {recipes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma receita pendente.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {recipes.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                    {r.material}
                  </span>
                  <span>{r.printer}</span>
                  <span>· {r.authorName}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm">
                  <span>Bico {r.nozzleTempC} °C</span>
                  <span>Mesa {r.bedTempC} °C</span>
                  {r.speedMms ? <span>{r.speedMms} mm/s</span> : null}
                  {r.retractionMm != null ? (
                    <span>retração {r.retractionMm} mm</span>
                  ) : null}
                  {r.flowPct ? <span>fluxo {r.flowPct}%</span> : null}
                  {r.fanPct != null ? <span>fan {r.fanPct}%</span> : null}
                </div>
                {r.notes ? (
                  <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
                    {r.notes}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={setRecipeStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <Button size="sm" type="submit">
                    <Check />
                    Aprovar
                  </Button>
                </form>
                <form action={setRecipeStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <Button size="sm" variant="outline" type="submit">
                    <X />
                    Recusar
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
