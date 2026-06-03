import { CreateBrandForm } from "@/components/create-brand-form";
import { CreateProductForm } from "@/components/create-product-form";
import { Button } from "@/components/ui/button";
import { materialLabel } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

import { setProductOrder } from "./actions";

export default async function ProdutosAdminPage() {
  const [products, brands] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ sortOrder: "desc" }, { name: "asc" }],
      include: { brand: true, _count: { select: { offers: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  const brandOptions = brands.map((b) => ({ id: b.id, name: b.name }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Nova marca</h2>
          <CreateBrandForm />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Novo produto</h2>
          {brandOptions.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Crie uma marca primeiro.
            </p>
          ) : (
            <CreateProductForm brands={brandOptions} />
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-1 text-lg font-semibold">
          Produtos ({products.length})
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Defina a <strong>ordem</strong> de cada produto na listagem do site:
          maior número aparece primeiro (0 = ordem normal por preço). Itens com
          ordem definida sobem para o topo desta lista. Patrocinados (lance)
          ficam acima quando a ordem é igual.
        </p>
        <ul className="divide-y rounded-xl border">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.brand.name} · {materialLabel(product.material)} ·{" "}
                  {product._count.offers} ofertas
                </p>
              </div>
              <form
                action={setProductOrder}
                className="flex shrink-0 items-center gap-2"
              >
                <input type="hidden" name="productId" value={product.id} />
                <label className="text-xs font-medium text-muted-foreground">
                  Ordem
                </label>
                <input
                  name="order"
                  type="number"
                  step={1}
                  defaultValue={product.sortOrder}
                  aria-label={`Ordem de ${product.name}`}
                  className="h-9 w-20 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm" variant="outline" type="submit">
                  Salvar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
