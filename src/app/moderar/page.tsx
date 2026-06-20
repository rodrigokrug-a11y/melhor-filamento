import Link from "next/link";

import { getPendingCoupons } from "@/lib/coupons";
import { getPendingReviews } from "@/lib/reviews";
import { getPendingTips } from "@/lib/tips";

export default async function ModerarPage() {
  const [coupons, reviews, tips] = await Promise.all([
    getPendingCoupons(),
    getPendingReviews(),
    getPendingTips(),
  ]);
  const cards = [
    { href: "/moderar/cupons", label: "Cupons pendentes", count: coupons.length },
    {
      href: "/moderar/avaliacoes",
      label: "Avaliações pendentes",
      count: reviews.length,
    },
    { href: "/moderar/dicas", label: "Dicas pendentes", count: tips.length },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-brand/40"
        >
          <p className="font-display text-3xl font-bold tnum">{c.count}</p>
          <p className="text-sm text-muted-foreground">{c.label}</p>
        </Link>
      ))}
    </div>
  );
}
