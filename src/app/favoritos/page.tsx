import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { FavoritesView } from "@/components/favorites-view";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Meus favoritos",
  description: "Produtos que você salvou para acompanhar o preço.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/favoritos" },
};

export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        icon={Heart}
        eyebrow="Sua lista"
        title="Meus favoritos"
        subtitle="Os produtos que você salvou — ficam guardados neste navegador."
      />
      <FavoritesView />
    </div>
  );
}
