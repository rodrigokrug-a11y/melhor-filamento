import type { MetadataRoute } from "next";

import { getAllBrandSlugs, getAllProductSlugs } from "@/lib/catalog";
import { FILAMENT_MATERIALS } from "@/lib/catalog-types";
import { siteUrl } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const [slugs, brandSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllBrandSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/filamentos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/resinas`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/impressoras`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/comparar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/ofertas`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/perto`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/marcas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/ranking`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/dicas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/receitas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/contato`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/ferramentas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/ia`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Páginas internas de cada ferramenta (exclui as que apontam pra fora).
  const toolRoutes: MetadataRoute.Sitemap = TOOLS.filter(
    (t) => t.available && !t.externalUrl,
  ).map((t) => ({
    url: `${base}/ferramentas/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const materialRoutes: MetadataRoute.Sitemap = FILAMENT_MATERIALS.map(
    (material) => ({
      url: `${base}/dica/${material}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/produto/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brandSlugs.map((slug) => ({
    url: `${base}/marca/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...materialRoutes,
    ...productRoutes,
    ...brandRoutes,
  ];
}
