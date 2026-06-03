import Link from "next/link";
import { Megaphone, X } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBrandsOverview } from "@/lib/catalog";

import {
  promoteBrand,
  setBrandLogo,
  setBrandOrder,
  unpromoteBrand,
} from "./actions";

export default async function AdminMarcasPage() {
  const brands = await getBrandsOverview();

  return (
    <div>
      <h2 className="text-lg font-semibold">Marcas</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Defina o logo, a <strong>ordem</strong> (maior número = aparece primeiro;
        0 = ordem normal) e promova marcas (patrocinadas ganham destaque, com
        selo). A ordem vale para a página de Marcas, os chips de filtro e a home.
      </p>

      {brands.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma marca cadastrada.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {brands.map((b) => (
            <li key={b.id} className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandLogo name={b.name} logoUrl={b.logoUrl} size={40} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/marcas/${b.id}`}
                        className="truncate font-medium underline-offset-2 hover:underline"
                      >
                        {b.name}
                      </Link>
                      {b.promotedActive ? (
                        <Badge className="gap-1">
                          <Megaphone className="size-3" />
                          Patrocinada
                        </Badge>
                      ) : null}
                    </div>
                    <Link
                      href={`/admin/marcas/${b.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {b.productCount}{" "}
                      {b.productCount === 1 ? "produto" : "produtos"} · anúncios e
                      avaliações →
                    </Link>
                  </div>
                </div>
                <div className="shrink-0">
                  {b.promotedActive ? (
                    <form action={unpromoteBrand}>
                      <input type="hidden" name="brandId" value={b.id} />
                      <Button size="sm" variant="outline" type="submit">
                        <X />
                        Remover
                      </Button>
                    </form>
                  ) : (
                    <form action={promoteBrand}>
                      <input type="hidden" name="brandId" value={b.id} />
                      <Button size="sm" type="submit">
                        <Megaphone />
                        Promover 30 dias
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={setBrandLogo} className="flex min-w-[240px] flex-1 gap-2">
                  <input type="hidden" name="brandId" value={b.id} />
                  <input
                    name="logoUrl"
                    type="url"
                    defaultValue={b.logoUrl ?? ""}
                    placeholder="https://.../logo.png"
                    aria-label={`Logo de ${b.name}`}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button size="sm" variant="outline" type="submit">
                    Salvar logo
                  </Button>
                </form>
                <form
                  action={setBrandOrder}
                  className="flex shrink-0 items-center gap-2"
                >
                  <input type="hidden" name="brandId" value={b.id} />
                  <label className="text-xs font-medium text-muted-foreground">
                    Ordem
                  </label>
                  <input
                    name="order"
                    type="number"
                    step={1}
                    defaultValue={b.sortOrder}
                    aria-label={`Ordem de ${b.name}`}
                    className="h-9 w-20 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button size="sm" variant="outline" type="submit">
                    Salvar
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
