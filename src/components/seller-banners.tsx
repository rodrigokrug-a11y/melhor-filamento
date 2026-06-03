import { deleteMyBanner, submitBanner } from "@/app/painel/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export type BannerRow = {
  id: string;
  placement: string;
  title: string;
  status: string;
  bidAmount: number;
};

const fieldClass =
  "mt-1 h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge variant="success">no ar</Badge>;
  if (status === "PENDING")
    return (
      <Badge variant="outline" className="text-amber-600">
        aguardando
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status === "REJECTED" ? "recusado" : status.toLowerCase()}
    </Badge>
  );
}

/** A loja envia banners (home grande ou faixa global) com um lance; o maior
 *  lance ativo por placement é exibido. Admin aprova. */
export function SellerBanners({ myBanners }: { myBanners: BannerRow[] }) {
  return (
    <div className="space-y-4">
      <form
        action={submitBanner}
        className="grid grid-cols-1 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2"
      >
        <label className="text-xs font-medium text-muted-foreground">
          Onde aparece
          <select name="placement" className={fieldClass}>
            <option value="HOME">Home — banner grande</option>
            <option value="GLOBAL">Faixa global — todas as páginas</option>
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Lance (R$/mês)
          <input name="bid" inputMode="decimal" placeholder="0,00" className={fieldClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
          Título
          <input name="title" required maxLength={80} className={fieldClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
          Subtítulo (opcional)
          <input name="subtitle" maxLength={120} className={fieldClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
          Imagem (URL, opcional)
          <input name="imageUrl" type="url" placeholder="https://.../banner.jpg" className={fieldClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
          Link de destino
          <input name="linkUrl" type="url" required placeholder="https://sualoja.com.br" className={fieldClass} />
        </label>
        <div className="sm:col-span-2">
          <Button size="sm" type="submit">
            Enviar banner
          </Button>
        </div>
      </form>

      {myBanners.length > 0 ? (
        <ul className="divide-y rounded-xl border">
          {myBanners.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {b.placement === "HOME" ? "Home" : "Faixa global"} ·{" "}
                  {formatBRL(b.bidAmount)}/mês
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {statusBadge(b.status)}
                <form action={deleteMyBanner}>
                  <input type="hidden" name="bannerId" value={b.id} />
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    remover
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
