import { BadgeCheck, ShieldCheck } from "lucide-react";

export function VerifiedStoreSeal() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal"
      title="Loja verificada pelo Melhor Filamento"
    >
      <BadgeCheck className="size-3.5" />
      Loja verificada
    </span>
  );
}

export function VerifiedOfferSeal() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"
      title="Oferta conferida pelo Melhor Filamento"
    >
      <ShieldCheck className="size-3.5" />
      Oferta verificada
    </span>
  );
}
