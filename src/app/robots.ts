import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/painel",
        "/cadastrar-oferta",
        "/entrar",
        "/go/",
        "/api/",
        // Parâmetros de filtro/ordenação secundários: evitam crawl-trap de
        // combinações de facetas (as listagens já canonicalizam p/ a URL limpa).
        "/*sort=",
        "/*cor=",
        "/*tech=",
        "/*faixa=",
        "/*marca=",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
