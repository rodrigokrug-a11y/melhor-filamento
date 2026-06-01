"use client";

import { useMemo } from "react";
import { Megaphone, Tag, Truck } from "lucide-react";

import { OfferLink } from "@/components/offer-link";
import { VerifiedOfferSeal, VerifiedStoreSeal } from "@/components/seals";
import { useRegion } from "@/components/use-region";
import { Badge } from "@/components/ui/badge";
import type { OfferView } from "@/lib/catalog-types";
import {
  type ShippingEstimate,
  estimateShipping,
  totalForRegion,
} from "@/lib/shipping";
import { cn, formatBRL } from "@/lib/utils";

const SELLER_TYPE_LABELS: Record<string, string> = {
  FACTORY: "Fabricante",
  RESELLER: "Revenda",
  MARKETPLACE: "Marketplace",
};

type ComputedOffer = OfferView & {
  shipping: ShippingEstimate | null;
  total: number;
  hasRegion: boolean;
};

export function OfferComparison({ offers }: { offers: OfferView[] }) {
  const { region } = useRegion();

  const { ranked, bestKey } = useMemo(() => {
    const uf = region?.uf ?? null;

    const computed: ComputedOffer[] = offers.map((o) => {
      const shipping = uf
        ? estimateShipping(o.shippingRules, uf, o.effectivePrice)
        : null;
      const total = uf ? totalForRegion(o.effectivePrice, shipping) : o.effectivePrice;
      return { ...o, shipping, total, hasRegion: uf != null };
    });

    computed.sort((a, b) => {
      if (a.sponsoredActive !== b.sponsoredActive) {
        return a.sponsoredActive ? -1 : 1;
      }
      return a.total - b.total;
    });

    const nonSponsored = computed.filter((o) => !o.sponsoredActive);
    const bestKey = nonSponsored.length
      ? Math.min(...nonSponsored.map((o) => o.total))
      : null;

    return { ranked: computed, bestKey };
  }, [offers, region]);

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Ainda não há ofertas disponíveis para este produto.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {ranked.map((offer) => (
        <li key={offer.id}>
          <OfferRow
            offer={offer}
            isBest={
              !offer.sponsoredActive &&
              bestKey != null &&
              offer.total === bestKey
            }
          />
        </li>
      ))}
    </ul>
  );
}

function shippingLabel(s: ShippingEstimate | null): string {
  if (!s) return "Frete a calcular";
  const dias = s.estimatedDays === 1 ? "1 dia útil" : `${s.estimatedDays} dias úteis`;
  if (s.free) return `Frete grátis · ${dias}`;
  return `Frete ${formatBRL(s.cost)} · ${dias}`;
}

function OfferRow({ offer, isBest }: { offer: ComputedOffer; isBest: boolean }) {
  const hasCoupon = offer.discount > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between",
        offer.sponsoredActive && "border-brand/40 bg-brand/5",
        isBest && "border-offer/50 bg-offer/5 ring-1 ring-offer/15",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{offer.sellerName}</span>
          {offer.sellerVerified ? <VerifiedStoreSeal /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {SELLER_TYPE_LABELS[offer.sellerType] ?? offer.sellerType}
          </span>
          <VerifiedOfferSeal />
          {offer.sponsoredActive ? (
            <Badge className="gap-1">
              <Megaphone className="size-3" />
              Patrocinado
            </Badge>
          ) : null}
          {isBest ? (
            <Badge variant="success">
              {offer.hasRegion ? "Menor total" : "Menor preço"}
            </Badge>
          ) : null}
        </div>
        {offer.hasRegion ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="size-3.5" />
            {shippingLabel(offer.shipping)}
          </p>
        ) : null}
        {offer.submittedByName ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            cadastrado por{" "}
            <span className="font-medium text-foreground">
              {offer.submittedByName}
            </span>
          </p>
        ) : null}
      </div>

      <div className="sm:text-right">
        {offer.hasRegion ? (
          <>
            <p className="text-xs text-muted-foreground">
              produto {formatBRL(offer.effectivePrice)}
            </p>
            <p className="font-display text-xl font-bold tnum">
              {formatBRL(offer.total)}
            </p>
            <p className="text-xs text-muted-foreground">total com frete</p>
          </>
        ) : (
          <>
            {hasCoupon ? (
              <p className="text-xs text-muted-foreground">
                <span className="line-through">{formatBRL(offer.price)}</span>{" "}
                com cupom
              </p>
            ) : null}
            <p className="font-display text-xl font-bold tnum">
              {formatBRL(offer.effectivePrice)}
            </p>
          </>
        )}
        {hasCoupon && offer.couponCode ? (
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-offer">
            <Tag className="size-3" />
            cupom {offer.couponCode}
          </p>
        ) : null}
      </div>

      <div className="shrink-0">
        <OfferLink offerId={offer.id} className="w-full sm:w-auto" />
      </div>
    </div>
  );
}
