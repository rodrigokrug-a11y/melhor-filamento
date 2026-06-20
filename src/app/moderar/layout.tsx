import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { requireModerator } from "@/lib/permissions";

const NAV = [
  { href: "/moderar", label: "Visão geral" },
  { href: "/moderar/cupons", label: "Cupons" },
  { href: "/moderar/avaliacoes", label: "Avaliações" },
  { href: "/moderar/dicas", label: "Dicas" },
];

export default async function ModerarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const v = await requireModerator();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="size-5 text-brand" />
        <h1 className="text-xl font-bold tracking-tight">Moderação</h1>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
          {v.isAdmin ? "admin" : "moderador"}
        </span>
      </div>
      <nav className="mb-6 flex flex-wrap gap-2">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-full border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
