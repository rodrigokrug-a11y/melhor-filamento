import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Link "Ver oferta" — vai DIRETO para a loja via /go/[offerId] (redirect
 * rastreado, conta o clique pra métrica). Sem modal e sem exigir dados
 * pessoais: pedir nome/e-mail para "liberar" a oferta era classificado pela
 * Navegação Segura do Google como engenharia social ("páginas enganosas").
 * A captação de leads segue de forma opt-in e não-bloqueante (ex.: alerta de
 * preço "Avise-me quando o preço baixar").
 */
export function OfferLink({
  offerId,
  className,
}: {
  offerId: string;
  className?: string;
}) {
  return (
    <a
      href={`/go/${offerId}`}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className={cn(buttonVariants(), className)}
    >
      Ver oferta <ArrowUpRight />
    </a>
  );
}
