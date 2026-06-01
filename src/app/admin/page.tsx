import { CalendarClock, Inbox, MapPin, MousePointerClick, Store } from "lucide-react";

import { prisma } from "@/lib/db";
import { REGION_LABELS, type Region } from "@/lib/shipping";

export default async function AdminDashboardPage() {
  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalClicks,
    weekClicks,
    pendingOffers,
    sellers,
    regionGroups,
    topGroups,
    recent,
  ] = await Promise.all([
    prisma.clickEvent.count(),
    prisma.clickEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.offer.count({ where: { status: "PENDING" } }),
    prisma.seller.count(),
    prisma.clickEvent.groupBy({ by: ["region"], _count: { _all: true } }),
    prisma.clickEvent.groupBy({
      by: ["offerId"],
      _count: { _all: true },
      orderBy: { _count: { offerId: "desc" } },
      take: 5,
    }),
    prisma.clickEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { offer: { include: { product: true, seller: true } } },
    }),
  ]);

  const topOfferIds = topGroups.map((g) => g.offerId);
  const topOffersData = topOfferIds.length
    ? await prisma.offer.findMany({
        where: { id: { in: topOfferIds } },
        include: { product: true, seller: true },
      })
    : [];
  const topOffers = topGroups.flatMap((g) => {
    const offer = topOffersData.find((o) => o.id === g.offerId);
    return offer ? [{ count: g._count._all, offer }] : [];
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<MousePointerClick />}
          label="Cliques (total)"
          value={totalClicks}
        />
        <Stat
          icon={<CalendarClock />}
          label="Cliques (7 dias)"
          value={weekClicks}
        />
        <Stat
          icon={<Inbox />}
          label="Ofertas pendentes"
          value={pendingOffers}
        />
        <Stat icon={<Store />} label="Lojas" value={sellers} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ofertas com mais cliques</h2>
        {topOffers.length === 0 ? (
          <Empty>Sem cliques registrados ainda.</Empty>
        ) : (
          <ul className="divide-y rounded-xl border">
            {topOffers.map(({ count, offer }) => (
              <li
                key={offer.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{offer.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {offer.seller.name}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {count} {count === 1 ? "clique" : "cliques"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Cliques por região</h2>
          {regionGroups.length === 0 ? (
            <Empty>Sem dados.</Empty>
          ) : (
            <ul className="divide-y rounded-xl border">
              {regionGroups.map((g) => (
                <li
                  key={g.region ?? "none"}
                  className="flex items-center justify-between p-3 text-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {g.region ? REGION_LABELS[g.region as Region] : "Sem região"}
                  </span>
                  <span className="font-semibold">{g._count._all}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Cliques recentes</h2>
          {recent.length === 0 ? (
            <Empty>Sem cliques.</Empty>
          ) : (
            <ul className="divide-y rounded-xl border">
              {recent.map((c) => (
                <li key={c.id} className="p-3 text-sm">
                  <p className="truncate font-medium">{c.offer.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.offer.seller.name}
                    {c.uf ? ` · ${c.uf}` : ""} ·{" "}
                    {c.createdAt.toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
