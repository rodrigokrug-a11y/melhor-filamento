"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  acceptConsent,
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent-store";

export function CookieConsent() {
  const consented = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  if (consented) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Cookie className="size-4" />
          </span>
          <p className="text-sm text-muted-foreground">
            Usamos cookies essenciais para lembrar sua região (CEP) e medir o
            uso do site. Ao continuar, você concorda com nossa{" "}
            <Link href="/privacidade" className="font-medium text-brand underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={acceptConsent}
          className="shrink-0"
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}
