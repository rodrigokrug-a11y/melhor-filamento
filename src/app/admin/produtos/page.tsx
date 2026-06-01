import { CreateBrandForm } from "@/components/create-brand-form";
import { CreateProductForm } from "@/components/create-product-form";
import { materialLabel } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

export default async function ProdutosAdminPage() {
  const [products, brands] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
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
        <h2 className="mb-3 text-lg font-semibold">
          Produtos ({products.length})
        </h2>
        <ul className="divide-y rounded-xl border">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.brand.name} · {materialLabel(product.material)} ·{" "}
                  {product._count.offers} ofertas
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
