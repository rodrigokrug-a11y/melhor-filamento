import type { Metadata } from "next";
import { Check, Megaphone, Square, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

import { setBannerStatus, setBoostStatus } from "./actions";

export const metadata: Metadata = {
  title: "Monetização",
  robots: { index: false },
};

const PLACEMENT_LABELS: Record<string, string> = {
  TOP_FILAMENT: "Topo · Filamentos",
  TOP_RESIN: "Topo · Resinas",
  TOP_PRINTER: "Topo · Impressoras",
  HOME: "Banner · Home",
  GLOBAL: "Banner · Global",
};

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge variant="success">ativo</Badge>;
  if (status === "PENDING")
    return (
      <Badge variant="outline" className="text-amber-600">
        pendente
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status === "REJECTED"
        ? "recusado"
        : status === "ENDED"
          ? "encerrado"
          : status.toLowerCase()}
    </Badge>
  );
}

function ApproveReject({
  idName,
  id,
  status,
  action,
}: {
  idName: string;
  id: string;
  status: string;
  action: (fd: FormData) => Promise<void>;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
      {statusBadge(status)}
      {status !== "ACTIVE" ? (
        <form action={action}>
          <input type="hidden" name={idName} value={id} />
          <input type="hidden" name="status" value="ACTIVE" />
          <Button size="sm" type="submit">
            <Check />
            Aprovar
          </Button>
        </form>
      ) : null}
      {status === "ACTIVE" ? (
        <form action={action}>
          <input type="hidden" name={idName} value={id} />
          <input type="hidden" name="status" value="ENDED" />
          <Button size="sm" variant="outline" type="submit">
            <Square />
            Encerrar
          </Button>
        </form>
      ) : null}
      {status === "PENDING" ? (
        <form action={action}>
          <input type="hidden" name={idName} value={id} />
          <input type="hidden" name="status" value="REJECTED" />
          <Button size="sm" variant="outline" type="submit">
            <X />
            Recusar
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export default async function AdminMonetizacaoPage() {
  const [boosts, banners] = await Promise.all([
    prisma.boost.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { bidAmount: "desc" }],
    }),
    prisma.banner.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { bidAmount: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="size-5 text-brand" />
          Lances de destaque (leilão)
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Aprove para ativar o destaque (a loja sobe ao topo da listagem). O
          maior lance ativo por categoria vence.
        </p>
        {boosts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum lance ainda.
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {boosts.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{b.seller.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PLACEMENT_LABELS[b.placement] ?? b.placement} ·{" "}
                    <strong>{formatBRL(Number(b.bidAmount))}/mês</strong>
                  </p>
                </div>
                <ApproveReject
                  idName="boostId"
                  id={b.id}
                  status={b.status}
                  action={setBoostStatus}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Banners</h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Aprove para exibir. O maior lance ativo por posição (home/global) é
          mostrado.
        </p>
        {banners.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum banner ainda.
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {banners.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.seller?.name ?? "—"} ·{" "}
                    {PLACEMENT_LABELS[b.placement] ?? b.placement} ·{" "}
                    <strong>{formatBRL(Number(b.bidAmount))}/mês</strong> ·{" "}
                    <a
                      href={b.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-teal hover:underline"
                    >
                      link
                    </a>
                  </p>
                </div>
                <ApproveReject
                  idName="bannerId"
                  id={b.id}
                  status={b.status}
                  action={setBannerStatus}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
