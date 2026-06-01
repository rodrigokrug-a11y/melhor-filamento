import type { Metadata } from "next";
import Link from "next/link";
import { Download, LinkIcon, Users } from "lucide-react";

import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Leads" };

function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function LeadsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [leads, total, last30, withOffer] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        offer: {
          include: {
            product: { select: { name: true, slug: true } },
            seller: { select: { name: true } },
          },
        },
      },
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { offerId: { not: null } } }),
  ]);

  const stats = [
    { label: "Total de leads", value: total, icon: Users },
    { label: "Últimos 30 dias", value: last30, icon: Users },
    { label: "Vinculados a oferta", value: withOffer, icon: LinkIcon },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Leads</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Contatos capturados quando o visitante clica em “Ver oferta”.
          </p>
        </div>
        {total > 0 ? (
          <Link
            href="/admin/leads/export"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Download className="size-4" />
            Exportar CSV
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <s.icon className="size-3.5 text-brand" />
              {s.label}
            </div>
            <p className="mt-1 font-display text-2xl font-bold tnum">{s.value}</p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum lead capturado ainda.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">E-mail</th>
                <th className="px-4 py-2.5 font-medium">Interesse</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground tnum">
                    {fmtDateTime(lead.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{lead.name}</td>
                  <td className="px-4 py-2.5">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-brand hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {lead.offer ? (
                      <Link
                        href={`/produto/${lead.offer.product.slug}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {lead.offer.product.name}
                        <span className="text-muted-foreground/70">
                          {" "}
                          · {lead.offer.seller.name}
                        </span>
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Dados pessoais (LGPD): use apenas para a finalidade informada ao titular.
        Exclua sob solicitação. Veja a{" "}
        <Link href="/privacidade" className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
