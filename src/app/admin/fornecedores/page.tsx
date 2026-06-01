import type { Metadata } from "next";
import { Building2, Rss, Tag } from "lucide-react";

import { SupplierImportForm } from "@/components/supplier-import-form";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Fornecedores",
  robots: { index: false },
};

export default async function FornecedoresPage() {
  const [sellers, feeds, brands] = await Promise.all([
    prisma.seller.count(),
    prisma.source.count({ where: { kind: "FEED" } }),
    prisma.brand.count(),
  ]);

  const stats = [
    { label: "Lojas no sistema", value: sellers, icon: Building2 },
    { label: "Fontes de feed", value: feeds, icon: Rss },
    { label: "Marcas", value: brands, icon: Tag },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold">Importar fornecedores</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cole o JSON da pesquisa de fornecedores (ou suba um arquivo). O sistema
        cria/atualiza as <strong>lojas</strong>, as <strong>marcas</strong> e as{" "}
        <strong>fontes de feed</strong>, e geocodifica os endereços para o mapa.
        A importação é segura para repetir — atualiza pelo domínio em vez de
        duplicar.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((st) => (
          <div key={st.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <st.icon className="size-3.5 text-brand" />
              {st.label}
            </div>
            <p className="mt-1 font-display text-2xl font-bold tnum">{st.value}</p>
          </div>
        ))}
      </div>

      <SupplierImportForm />

      <details className="mt-6 rounded-lg border bg-muted/20 p-3 text-sm">
        <summary className="cursor-pointer font-medium">Formato esperado</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-background p-3 text-xs">
{`{
  "suppliers": [
    {
      "name": "3D Lab",
      "website": "https://3dlab.com.br",
      "type": "FABRICANTE",            // FABRICANTE | REVENDA | MARKETPLACE
      "brands": ["3D Lab"],
      "hq": { "city": "Betim", "uf": "MG", "cep": null },
      "physical_stores": [{ "pickup": true }],
      "ingestion": { "google_merchant_feed_url": null }
    }
  ]
}`}
        </pre>
        <p className="mt-2 text-muted-foreground">
          Campos desconhecidos podem ser <code>null</code>. Quem tiver
          <code> google_merchant_feed_url</code> vira uma fonte de feed
          automaticamente.
        </p>
      </details>
    </div>
  );
}
