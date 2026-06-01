import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { NearbyView } from "@/components/nearby-view";
import { PageHeader } from "@/components/page-header";
import { getStoresForMap } from "@/lib/catalog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lojas perto de você",
  description:
    "Veja em quais lojas o filamento está disponível mais perto de você — com opção de retirada na loja.",
  alternates: { canonical: "/perto" },
  openGraph: {
    title: "Lojas perto de você",
    description:
      "Encontre filamento mais perto de você e veja onde dá para retirar na loja.",
    url: "/perto",
    type: "website",
  },
};

export default async function PertoPage() {
  const stores = await getStoresForMap();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        icon={MapPin}
        eyebrow="Perto de você"
        title="Lojas perto de você"
        subtitle="Encontre onde comprar filamento mais perto — e veja quais lojas permitem retirar no balcão."
      />
      <NearbyView stores={stores} />
    </div>
  );
}
