import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/mensagens", label: "Mensagens" },
  { href: "/admin/solicitacoes", label: "Solicitações" },
  { href: "/admin/moderacao", label: "Moderação" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/avaliacoes", label: "Avaliações" },
  { href: "/admin/dicas", label: "Dicas" },
  { href: "/admin/importar", label: "Importar" },
  { href: "/admin/fornecedores", label: "Fornecedores" },
  { href: "/admin/fontes", label: "Fontes" },
  { href: "/admin/patrocinios", label: "Patrocínios" },
  { href: "/admin/monetizacao", label: "Monetização" },
  { href: "/admin/lojas", label: "Lojas" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/produtos", label: "Catálogo" },
  { href: "/cadastrar-oferta", label: "Nova oferta" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
      <nav className="mt-4 flex flex-wrap gap-1 border-b pb-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
