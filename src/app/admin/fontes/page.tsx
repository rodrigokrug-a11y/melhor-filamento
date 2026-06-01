import { Play, Rss, Trash2 } from "lucide-react";

import { CreateSourceForm } from "@/components/create-source-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

import { deleteSource, runSourceNow, toggleSource } from "./actions";

const KIND_LABELS: Record<string, string> = {
  PAGE: "Página",
  FEED: "Feed",
  SITEMAP: "Sitemap",
};

export default async function FontesPage() {
  const [sources, sellers] = await Promise.all([
    prisma.source.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true } },
        _count: { select: { offers: true } },
      },
    }),
    prisma.seller.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-lg font-semibold">Nova fonte</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Cadastre uma página de produto ou um feed XML de uma loja. As ofertas
          ingeridas entram em análise.
        </p>
        <CreateSourceForm sellers={sellers} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Fontes ({sources.length})</h2>
        {sources.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Nenhuma fonte cadastrada.
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {sources.map((source) => (
              <li key={source.id} className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Rss className="size-4 text-muted-foreground" />
                      <span className="font-medium">{source.seller.name}</span>
                      <Badge variant="secondary">
                        {KIND_LABELS[source.kind] ?? source.kind}
                      </Badge>
                      {source.enabled ? (
                        <Badge variant="success">ativa</Badge>
                      ) : (
                        <Badge variant="outline">pausada</Badge>
                      )}
                      {source.label ? (
                        <span className="text-xs text-muted-foreground">
                          {source.label}
                        </span>
                      ) : null}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="mt-1 block truncate text-xs text-primary hover:underline"
                    >
                      {source.url}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {source._count.offers} oferta(s)
                      {source.lastRunAt
                        ? ` · ${source.lastStatus ?? "—"} · ${source.lastRunAt.toLocaleString("pt-BR")}`
                        : " · nunca rodou"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={runSourceNow}>
                      <input type="hidden" name="sourceId" value={source.id} />
                      <Button size="sm" type="submit">
                        <Play />
                        Rodar
                      </Button>
                    </form>
                    <form action={toggleSource}>
                      <input type="hidden" name="sourceId" value={source.id} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={source.enabled ? "false" : "true"}
                      />
                      <Button size="sm" variant="outline" type="submit">
                        {source.enabled ? "Pausar" : "Ativar"}
                      </Button>
                    </form>
                    <form action={deleteSource}>
                      <input type="hidden" name="sourceId" value={source.id} />
                      <Button
                        size="sm"
                        variant="outline"
                        type="submit"
                        aria-label="Remover fonte"
                      >
                        <Trash2 />
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
