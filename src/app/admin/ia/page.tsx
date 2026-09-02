import type { Metadata } from "next";

import { getAiStats } from "@/lib/ai-stats";

export const metadata: Metadata = { title: "Uso da IA" };

// Números de operação: sempre frescos, nunca de cache.
export const dynamic = "force-dynamic";

const TOOL_LABEL: Record<string, string> = {
  ASSISTENTE: "Assistente",
  DIAGNOSTICO: "Diagnóstico por foto",
};

function usd(v: number): string {
  return `US$ ${v.toFixed(2)}`;
}

function int(v: number): string {
  return v.toLocaleString("pt-BR");
}

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tnum">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default async function Page() {
  const s = await getAiStats(30);
  const maxDay = Math.max(1, ...s.byDay.map((d) => d.calls));
  const errorPct = s.totalCalls ? (s.failedCalls / s.totalCalls) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">
          Uso da IA
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Últimos {s.periodDays} dias. Só metadados são registrados — nunca a
          pergunta nem a resposta.
        </p>
      </div>

      {s.totalCalls === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Nenhuma chamada registrada ainda. A contagem começa a partir do
          momento em que o registro entrou no ar — o uso anterior não foi medido.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card
              label="Chamadas"
              value={int(s.totalCalls)}
              hint={`${int(s.uniqueUsers)} ${s.uniqueUsers === 1 ? "pessoa" : "pessoas"}`}
            />
            <Card
              label="Custo estimado"
              value={usd(s.cost)}
              hint={`${int(s.inputTokens + s.outputTokens)} tokens`}
            />
            <Card
              label="Falhas"
              value={`${errorPct.toFixed(1)}%`}
              hint={`${int(s.failedCalls)} de ${int(s.totalCalls)}`}
            />
            <Card
              label="Tempo médio"
              value={`${(s.avgLatencyMs / 1000).toFixed(1)}s`}
              hint="por resposta"
            />
          </div>

          <section>
            <h3 className="mb-3 font-display text-base font-bold">
              Por ferramenta
            </h3>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Ferramenta</th>
                    <th className="px-4 py-2 text-right font-medium">Chamadas</th>
                    <th className="px-4 py-2 text-right font-medium">Falhas</th>
                    <th className="px-4 py-2 text-right font-medium">Tokens</th>
                    <th className="px-4 py-2 text-right font-medium">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {s.byTool.map((t) => (
                    <tr key={t.tool} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">
                        {TOOL_LABEL[t.tool] ?? t.tool}
                      </td>
                      <td className="px-4 py-2 text-right tnum">
                        {int(t.calls)}
                      </td>
                      <td className="px-4 py-2 text-right tnum">
                        {int(t.failed)}
                      </td>
                      <td className="px-4 py-2 text-right tnum">
                        {int(t.inputTokens + t.outputTokens)}
                      </td>
                      <td className="px-4 py-2 text-right tnum">
                        {usd(t.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-display text-base font-bold">
              Chamadas por dia
            </h3>
            <div className="rounded-2xl border bg-card p-4">
              {/* items-stretch (padrão) faz cada coluna ocupar os h-32: altura
                  em porcentagem só resolve contra um pai de altura definida —
                  com items-end a coluna encolhe e as barras somem. */}
              <div className="flex h-32 gap-1">
                {s.byDay.map((d) => (
                  <div
                    key={d.date}
                    className="group flex flex-1 items-end"
                    title={`${d.date}: ${d.calls} chamada(s)`}
                  >
                    <div
                      className="w-full rounded-t bg-brand/70 transition-colors group-hover:bg-brand"
                      style={{
                        height: `${Math.max(2, (d.calls / maxDay) * 100)}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{s.byDay[0]?.date}</span>
                <span>{s.byDay[s.byDay.length - 1]?.date}</span>
              </div>
            </div>
          </section>

          {s.topUsers.length > 0 ? (
            <section>
              <h3 className="mb-3 font-display text-base font-bold">
                Quem mais usa
              </h3>
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Usuário</th>
                      <th className="px-4 py-2 text-right font-medium">
                        Chamadas
                      </th>
                      <th className="px-4 py-2 text-right font-medium">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.topUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2 text-right tnum">
                          {int(u.calls)}
                        </td>
                        <td className="px-4 py-2 text-right tnum">
                          {usd(u.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Custo calculado a partir dos tokens registrados, ao preço do Claude
            Haiku 4.5 (US$ 1,00 por milhão de entrada, US$ 5,00 de saída). Se
            trocar o modelo, ajuste AI_PRICE_INPUT_PER_MTOK e
            AI_PRICE_OUTPUT_PER_MTOK no .env.
          </p>
        </>
      )}
    </div>
  );
}
