"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import Script from "next/script";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent-store";

// IDs públicos (inlinados no build). Vazios => componente não renderiza nada.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google tag (gtag.js) para GA4 + Google Ads, integrado ao banner de cookies.
 *
 * Estratégia LGPD (Consent Mode v2):
 * - O tag carrega sempre, mas com consentimento *negado* por padrão
 *   (pings sem cookies; nada é gravado no navegador).
 * - Quando a pessoa clica "Aceitar" (cookie mf_consent=1), atualizamos o
 *   consentimento para "granted" e o GA/Ads passam a medir normalmente.
 *
 * Não renderiza nada se NEXT_PUBLIC_GA_ID não estiver definido — seguro
 * para rodar em dev/preview sem configuração.
 */
export function Analytics() {
  const consented = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  useEffect(() => {
    if (!GA_ID || !consented) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  }, [consented]);

  if (!GA_ID) return null;

  const initScript = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js', new Date());",
    "gtag('consent','default',{",
    "  ad_storage:'denied',",
    "  analytics_storage:'denied',",
    "  ad_user_data:'denied',",
    "  ad_personalization:'denied'",
    "});",
    `gtag('config','${GA_ID}');`,
    ADS_ID ? `gtag('config','${ADS_ID}');` : "",
  ].join("\n");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: initScript }}
      />
    </>
  );
}
