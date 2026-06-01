import type { Metadata } from "next";
import Link from "next/link";
import { Check, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

import { resolveBrandRequests } from "./actions";

export const metadata: Metadata = {
  title: "Solicitações",
  robots: { index: false },
};

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function SolicitacoesPage() {
  const requests = await prisma.offerRequest.findMany({
    where: { handled: false },
    include: { brand: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Group = {
    brandId: string;
    name: string;
    slug: string;
    count: number;
    emails: Set<string>;
    last: Date;
  };
  const groups = new Map<string, Group>();
  for (const r of requests) {
    const g = groups.get(r.brandId);
    if (g) {
      g.count += 1;
      if (r.email) g.emails.add(r.email);
    } else {
      groups.set(r.brandId, {
        brandId: r.brandId,
        name: r.brand.name,
        slug: r.brand.slug,
        count: 1,
        emails: new Set(r.email ? [r.email] : []),
        last: r.createdAt,
      });
    }
  }
  const list = [...groups.values()].sort((a, b) => b.count - a.count);

  return (
    <div>
      <h2 className="text-lg font-semibold">Pedidos de ofertas por marca</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Demanda do público. Entre em contato com a marca/loja, cadastre as ofertas
        e marque como resolvido.
      </p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum pedido pendente.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((g) => (
            <li
              key={g.brandId}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-brand" />
                  <Link
                    href={`/marca/${g.slug}`}
                    className="font-medium hover:underline"
                  >
                    {g.name}
                  </Link>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    {g.count} {g.count === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Último: {fmtDate(g.last)}
                  {g.emails.size > 0
                    ? ` · contatos: ${[...g.emails].join(", ")}`
                    : " · sem e-mail"}
                </p>
              </div>
              <form action={resolveBrandRequests} className="shrink-0">
                <input type="hidden" name="brandId" value={g.brandId} />
                <Button size="sm" variant="outline" type="submit">
                  <Check className="size-4" />
                  Resolver
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
