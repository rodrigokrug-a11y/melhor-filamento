import type { Metadata } from "next";
import { Manrope, Sora, Space_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { CompareBar } from "@/components/compare-bar";
import { CookieConsent } from "@/components/cookie-consent";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteJsonLd } from "@/lib/seo";

// Manrope: UI / texto · Sora: títulos (combina com o wordmark) · Space Mono: dados/preços
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

// Evita flash de tema: aplica .dark antes da pintura, conforme preferência salva.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const siteDescription =
  "Compare preços de filamentos e resinas para impressão 3D no Brasil, com frete estimado para o seu CEP. Encontre a oferta mais barata por região.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Melhor Filamento — Comparador de preços de filamentos e resinas 3D",
    template: "%s | Melhor Filamento",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Melhor Filamento",
    title:
      "Melhor Filamento — Comparador de preços de filamentos e resinas 3D",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Melhor Filamento",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Verificação do Google Search Console: defina GOOGLE_SITE_VERIFICATION no
  // .env do servidor (o código que o GSC fornece no método "tag HTML").
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${sora.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteJsonLd() }}
        />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Pular para o conteúdo
        </a>
        <Providers>
          <SiteHeader />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <CompareBar />
          <CookieConsent />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
