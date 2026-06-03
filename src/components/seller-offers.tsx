import { setMyOfferStatus, updateMyOffer } from "@/app/painel/actions";
import { OfferStatusBadge } from "@/components/offer-status-badge";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";

export type SellerOfferRow = {
  id: string;
  productName: string;
  productMaterial: string;
  productImageUrl: string | null;
  price: number;
  url: string;
  couponCode: string | null;
  imageUrl: string | null;
  status: string;
};

const inputClass =
  "mt-1 h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Lista de anúncios da própria loja, com edição inline (preço, link, cupom,
 *  foto) e ativar/pausar. As ações verificam que a oferta é da loja do usuário. */
export function SellerOffers({ offers }: { offers: SellerOfferRow[] }) {
  return (
    <ul className="space-y-4">
      {offers.map((o) => {
        const active = o.status === "APPROVED";
        return (
          <li key={o.id} className="rounded-2xl border bg-card p-4">
            <div className="flex gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                <ProductImage
                  src={o.imageUrl ?? o.productImageUrl}
                  alt={o.productName}
                  sizes="80px"
                  className="object-cover"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      sem foto
                    </div>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate font-medium">{o.productName}</p>
                  <OfferStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {materialLabel(o.productMaterial)}
                </p>

                <form
                  action={updateMyOffer}
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <input type="hidden" name="offerId" value={o.id} />
                  <label className="text-xs font-medium text-muted-foreground">
                    Preço (R$)
                    <input
                      name="price"
                      defaultValue={o.price.toFixed(2)}
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground">
                    Cupom (opcional)
                    <input
                      name="couponCode"
                      defaultValue={o.couponCode ?? ""}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                    Link da oferta
                    <input
                      name="url"
                      type="url"
                      defaultValue={o.url}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                    Foto (URL)
                    <input
                      name="imageUrl"
                      type="url"
                      defaultValue={o.imageUrl ?? ""}
                      placeholder="https://.../foto.jpg"
                      className={inputClass}
                    />
                  </label>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Button size="sm" type="submit">
                      Salvar
                    </Button>
                  </div>
                </form>

                <form action={setMyOfferStatus} className="mt-2">
                  <input type="hidden" name="offerId" value={o.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={active ? "PENDING" : "APPROVED"}
                  />
                  <Button size="sm" variant="outline" type="submit">
                    {active ? "Pausar anúncio" : "Ativar anúncio"}
                  </Button>
                </form>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
