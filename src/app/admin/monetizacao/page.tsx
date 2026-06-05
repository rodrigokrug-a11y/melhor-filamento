import type { Metadata } from "next";
import { ExternalLink, Megaphone, Pause, Play, Plus, Trash2 } from "lucide-react";

import { BannerImageField } from "@/components/banner-image-field";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductPicklist } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

import {
  createBanner,
  createBoost,
  deleteBanner,
  deleteBoost,
  setBannerStatus,
  setBoostStatus,
  updateBanner,
  updateBoost,
} from "./actions";

export const metadata: Metadata = {
  title: "Monetização",
  robots: { index: false },
};

const PLACEMENT_LABELS: Record<string, string> = {
  TOP_FILAMENT: "Topo · Filamentos",
  TOP_RESIN: "Topo · Resinas",
  TOP_PRINTER: "Topo · Impressoras",
  HOME: "Banner · Página inicial",
  HERO: "Display do hero · Página inicial",
  FILAMENTOS: "Banner · Filamentos",
  RESINAS: "Banner · Resinas",
  IMPRESSORAS: "Banner · Impressoras",
  MARCAS: "Banner · Marcas",
  COMPARAR: "Banner · Comparar",
  RANKING: "Banner · Ranking",
  DICAS: "Banner · Dicas",
  PRODUTO: "Banner · Páginas de produto",
  GLOBAL: "Banner · Todas as páginas (fallback)",
};

// Posições de banner por página, na ordem do menu (GLOBAL por último, é o fallback).
const BANNER_PLACEMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "HOME", label: "Página inicial" },
  { value: "HERO", label: "Display do hero (home)" },
  { value: "FILAMENTOS", label: "Filamentos" },
  { value: "RESINAS", label: "Resinas" },
  { value: "IMPRESSORAS", label: "Impressoras" },
  { value: "MARCAS", label: "Marcas" },
  { value: "COMPARAR", label: "Comparar" },
  { value: "RANKING", label: "Ranking" },
  { value: "DICAS", label: "Dicas" },
  { value: "PRODUTO", label: "Páginas de produto" },
  { value: "GLOBAL", label: "Todas as páginas (fallback)" },
];

const inputCls =
  "h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const fieldCls =
  "flex flex-col gap-1 text-xs font-medium text-muted-foreground";

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge variant="success">ativo</Badge>;
  if (status === "PAUSED")
    return (
      <Badge variant="outline" className="text-amber-600">
        pausado
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status === "REJECTED"
        ? "recusado"
        : status === "ENDED"
          ? "encerrado"
          : status === "PENDING"
            ? "pendente"
            : status.toLowerCase()}
    </Badge>
  );
}

/** Botão Ativar (se não está ativo) ou Pausar (se está). */
function ToggleStatus({
  idName,
  id,
  status,
  action,
}: {
  idName: string;
  id: string;
  status: string;
  action: (fd: FormData) => Promise<void>;
}) {
  const next = status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  return (
    <form action={action}>
      <input type="hidden" name={idName} value={id} />
      <input type="hidden" name="status" value={next} />
      <Button size="sm" variant="outline" type="submit">
        {status === "ACTIVE" ? <Pause /> : <Play />}
        {status === "ACTIVE" ? "Pausar" : "Ativar"}
      </Button>
    </form>
  );
}

function DeleteButton({
  idName,
  id,
  action,
  label,
}: {
  idName: string;
  id: string;
  action: (fd: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={idName} value={id} />
      <ConfirmSubmitButton confirmText={label} variant="destructive">
        <Trash2 />
        Excluir
      </ConfirmSubmitButton>
    </form>
  );
}

function BannerFields({
  banner,
  sellers,
  products,
  taken,
}: {
  banner?: {
    placements: string[];
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    linkUrl: string;
    ctaLabel: string | null;
    bidAmount: number;
    sellerId: string | null;
    productId: string | null;
  };
  sellers: { id: string; name: string }[];
  products: { id: string; label: string }[];
  taken: Record<string, string>; // página → título do banner ativo que já a usa
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={`${fieldCls} sm:col-span-2`}>
        <span>Páginas onde aparece (marque uma ou mais)</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {BANNER_PLACEMENT_OPTIONS.map((o) => {
            const usedBy = taken[o.value];
            const checked = banner?.placements.includes(o.value) ?? false;
            return (
              <label
                key={o.value}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal ${
                  usedBy
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer text-foreground hover:bg-accent"
                }`}
              >
                <input
                  type="checkbox"
                  name="placements"
                  value={o.value}
                  defaultChecked={checked}
                  disabled={!!usedBy}
                  className="size-4 accent-brand"
                />
                <span>{o.label}</span>
                {usedBy ? (
                  <span className="ml-auto truncate text-[11px] text-muted-foreground">
                    em uso
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>
      <label className={`${fieldCls} sm:col-span-2`}>
        Destacar um produto (display do hero) — opcional
        <select
          name="productId"
          defaultValue={banner?.productId ?? ""}
          className={inputCls}
        >
          <option value="">— Nenhum (usar imagem/título acima) —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          Se escolher um produto, o anúncio do hero é montado automaticamente
          (imagem, nome, preço e link do produto) — não precisa de imagem nem
          link. Use junto da posição “Display do hero”.
        </span>
      </label>
      <label className={fieldCls}>
        Lance (R$/mês)
        <input
          name="bid"
          inputMode="decimal"
          defaultValue={banner ? String(banner.bidAmount) : ""}
          placeholder="0,00"
          className={inputCls}
        />
      </label>
      <label className={`${fieldCls} sm:col-span-2`}>
        Título (não precisa se escolher um produto acima)
        <input
          name="title"
          maxLength={120}
          defaultValue={banner?.title ?? ""}
          placeholder="Ex.: Filamentos PLA com 20% OFF na Loja X"
          className={inputCls}
        />
      </label>
      <label className={`${fieldCls} sm:col-span-2`}>
        Subtítulo (opcional)
        <input
          name="subtitle"
          maxLength={160}
          defaultValue={banner?.subtitle ?? ""}
          className={inputCls}
        />
      </label>
      <div className={`${fieldCls} sm:col-span-2`}>
        <span>Imagem (opcional) — envie do computador ou cole uma URL</span>
        <BannerImageField defaultValue={banner?.imageUrl} />
      </div>
      <label className={`${fieldCls} sm:col-span-2`}>
        Link de destino (opcional — em branco = banner não clicável)
        <input
          name="linkUrl"
          type="url"
          defaultValue={banner?.linkUrl ?? ""}
          placeholder="https://… (deixe vazio para não ter link)"
          className={inputCls}
        />
      </label>
      <label className={`${fieldCls} sm:col-span-2`}>
        Texto do botão (aparece só quando há link)
        <input
          name="ctaLabel"
          type="text"
          maxLength={40}
          defaultValue={banner?.ctaLabel ?? ""}
          placeholder="Saiba mais"
          className={inputCls}
        />
      </label>
      <label className={`${fieldCls} sm:col-span-2`}>
        Loja (opcional)
        <select
          name="sellerId"
          defaultValue={banner?.sellerId ?? ""}
          className={inputCls}
        >
          <option value="">— Nenhuma (anúncio do próprio site) —</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default async function AdminMonetizacaoPage() {
  const [boosts, banners, sellers, products] = await Promise.all([
    prisma.boost.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { bidAmount: "desc" }],
    }),
    prisma.banner.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { bidAmount: "desc" }],
    }),
    prisma.seller.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getProductPicklist(),
  ]);

  // Página → título do banner ATIVO que já a ocupa (para desabilitar no seletor).
  // excludeId permite que, ao editar, o banner não bloqueie as próprias páginas.
  const takenMap = (excludeId?: string): Record<string, string> => {
    const m: Record<string, string> = {};
    for (const b of banners) {
      if (b.status !== "ACTIVE" || (excludeId && b.id === excludeId)) continue;
      for (const p of b.placements) if (!(p in m)) m[p] = b.title;
    }
    return m;
  };

  return (
    <div className="space-y-12">
      {/* ───────── Lances de destaque ───────── */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="size-5 text-brand" />
          Lances de destaque (topo da listagem)
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Coloque uma loja no <strong>topo</strong> de Filamentos, Resinas ou
          Impressoras, com selo “Patrocinado”. O maior lance ativo por categoria
          vence. Você gere tudo aqui — a loja não dá lances.
        </p>

        <form
          action={createBoost}
          className="flex flex-wrap items-end gap-3 rounded-xl border bg-muted/30 p-4"
        >
          <label className={fieldCls}>
            Loja
            <select
              name="sellerId"
              required
              defaultValue=""
              className={`${inputCls} min-w-[180px]`}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldCls}>
            Categoria
            <select name="placement" required className={inputCls}>
              <option value="TOP_FILAMENT">Topo · Filamentos</option>
              <option value="TOP_RESIN">Topo · Resinas</option>
              <option value="TOP_PRINTER">Topo · Impressoras</option>
            </select>
          </label>
          <label className={fieldCls}>
            Lance (R$/mês)
            <input
              name="bid"
              inputMode="decimal"
              required
              placeholder="0,00"
              className={`${inputCls} w-28`}
            />
          </label>
          <Button type="submit">
            <Plus />
            Criar lance
          </Button>
        </form>

        {boosts.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum lance ainda. Crie um acima.
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border">
            {boosts.map((b) => (
              <li key={b.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{b.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {PLACEMENT_LABELS[b.placement] ?? b.placement} ·{" "}
                      <strong>{formatBRL(Number(b.bidAmount))}/mês</strong>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {statusBadge(b.status)}
                    <ToggleStatus
                      idName="boostId"
                      id={b.id}
                      status={b.status}
                      action={setBoostStatus}
                    />
                    <DeleteButton
                      idName="boostId"
                      id={b.id}
                      action={deleteBoost}
                      label={`Excluir o lance de ${b.seller.name}?`}
                    />
                  </div>
                </div>
                <details className="group">
                  <summary className="cursor-pointer text-xs font-medium text-teal hover:underline">
                    Editar lance
                  </summary>
                  <form
                    action={updateBoost}
                    className="mt-2 flex items-end gap-2"
                  >
                    <input type="hidden" name="boostId" value={b.id} />
                    <label className={fieldCls}>
                      Lance (R$/mês)
                      <input
                        name="bid"
                        inputMode="decimal"
                        defaultValue={String(Number(b.bidAmount))}
                        className={`${inputCls} w-28`}
                      />
                    </label>
                    <Button size="sm" type="submit">
                      Salvar
                    </Button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ───────── Banners ───────── */}
      <section>
        <h2 className="text-lg font-semibold">Banners</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          O banner aparece <strong>acima do título</strong>, como primeira coisa
          da página. Marque <strong>uma ou mais páginas</strong> onde ele deve
          aparecer. Páginas já ocupadas por outro banner ativo ficam{" "}
          <strong>desabilitadas</strong>. Use <strong>Todas as páginas</strong>{" "}
          como reserva (vale onde não houver banner específico).
        </p>

        <details className="rounded-xl border bg-muted/30 p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <Plus className="size-4" />
            Novo banner
          </summary>
          <form action={createBanner} className="mt-4 space-y-3">
            <BannerFields
              sellers={sellers}
              products={products}
              taken={takenMap()}
            />
            <Button type="submit">
              <Plus />
              Criar banner
            </Button>
          </form>
        </details>

        {banners.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum banner ainda. Crie um acima.
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border">
            {banners.map((b) => (
              <li key={b.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.placements
                        .map((p) => PLACEMENT_LABELS[p] ?? p)
                        .join(", ") || "—"}{" "}
                      ·{" "}
                      <strong>{formatBRL(Number(b.bidAmount))}/mês</strong>
                      {b.seller?.name ? ` · ${b.seller.name}` : ""} ·{" "}
                      {b.linkUrl ? (
                        <a
                          href={b.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-0.5 text-teal hover:underline"
                        >
                          link <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">sem link</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {statusBadge(b.status)}
                    <ToggleStatus
                      idName="bannerId"
                      id={b.id}
                      status={b.status}
                      action={setBannerStatus}
                    />
                    <DeleteButton
                      idName="bannerId"
                      id={b.id}
                      action={deleteBanner}
                      label={`Excluir o banner “${b.title}”?`}
                    />
                  </div>
                </div>
                <details className="group">
                  <summary className="cursor-pointer text-xs font-medium text-teal hover:underline">
                    Editar banner
                  </summary>
                  <form action={updateBanner} className="mt-3 space-y-3">
                    <input type="hidden" name="bannerId" value={b.id} />
                    <BannerFields
                      sellers={sellers}
                      products={products}
                      taken={takenMap(b.id)}
                      banner={{
                        placements: b.placements,
                        title: b.title,
                        subtitle: b.subtitle,
                        imageUrl: b.imageUrl,
                        linkUrl: b.linkUrl,
                        ctaLabel: b.ctaLabel,
                        bidAmount: Number(b.bidAmount),
                        sellerId: b.sellerId,
                        productId: b.productId,
                      }}
                    />
                    <Button size="sm" type="submit">
                      Salvar alterações
                    </Button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
