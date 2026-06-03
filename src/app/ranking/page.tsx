import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";
import { Stars } from "@/components/stars";
import { materialLabel } from "@/lib/catalog-types";
import { getRanking } from "@/lib/reviews";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ranking — Melhores filamentos e impressoras",
  description:
    "Os filamentos e impressoras 3D mais bem avaliados pela comunidade, ordenados pela nota.",
  alternates: { canonical: "/ranking" },
  openGraph: {
    title: "Ranking — Melhores filamentos e impressoras",
    description:
      "Os filamentos e impressoras 3D mais bem avaliados pela comunidade.",
    url: "/ranking",
    type: "website",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MEDALS = [
  "bg-amber-400 text-amber-950",
  "bg-zinc-300 text-zinc-800",
  "bg-orange-300 text-orange-950",
];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const isPrinter = sp.tipo === "impressoras";
  const material =
    !isPrinter && typeof sp.material === "string" ? sp.material : undefined;
  const items = isPrinter
    ? await getRanking(undefined, "PRINTER")
    : await getRanking(material, "FILAMENT");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageBanner placement="RANKING" />
      <PageHeader
        icon={Trophy}
        eyebrow="Comunidade"
        title={isPrinter ? "Melhores impressoras" : "Melhores filamentos"}
        subtitle="Ranking pela nota da comunidade — quanto melhor avaliado, mais alto."
      />

      <div className="mb-5 inline-flex rounded-full border bg-card p-1 text-sm font-medium">
        <Link
          href="/ranking"
          className={cn(
            "rounded-full px-4 py-1.5 transition-colors",
            !isPrinter
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Filamentos
        </Link>
        <Link
          href="/ranking?tipo=impressoras"
          className={cn(
            "rounded-full px-4 py-1.5 transition-colors",
            isPrinter
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Impressoras
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Ainda não há avaliações de {isPrinter ? "impressoras" : "filamentos"}.{" "}
          <Link
            href={isPrinter ? "/impressoras" : "/filamentos"}
            className="text-brand hover:underline"
          >
            Avalie {isPrinter ? "uma impressora" : "um filamento"}
          </Link>{" "}
          para começar o ranking.
        </div>
      ) : (
        <ol className="space-y-3">
          {items.map((it, i) => (
            <li key={it.id}>
              <Link
                href={`/produto/${it.slug}`}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                    MEDALS[i] ?? "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.brandName}
                    {!isPrinter ? ` · ${materialLabel(it.material)}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Stars value={it.average} size={14} />
                    <span className="text-sm font-semibold tnum">
                      {it.average.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {it.count} {it.count === 1 ? "avaliação" : "avaliações"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
