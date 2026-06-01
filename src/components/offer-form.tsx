"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Send, Sparkles } from "lucide-react";

import { createOffer, scrapeOfferForForm } from "@/app/cadastrar-oferta/actions";
import { Button } from "@/components/ui/button";

const initialState: { error?: string; ok?: boolean; approved?: boolean } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function OfferForm({
  products,
  stores,
  loggedIn = false,
  defaultName = "",
  defaultProductId = "",
  isAdmin = false,
}: {
  products: { id: string; label: string }[];
  stores: string[];
  loggedIn?: boolean;
  defaultName?: string;
  defaultProductId?: string;
  isAdmin?: boolean;
}) {
  const [state, formAction, pending] = useActionState(createOffer, initialState);

  const urlRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const storeRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLSelectElement>(null);

  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    name: string | null;
    image: string | null;
  } | null>(null);

  async function handlePull() {
    const url = urlRef.current?.value?.trim() ?? "";
    if (!url) {
      setScrapeError("Cole o link da oferta primeiro.");
      return;
    }
    setScraping(true);
    setScrapeError(null);
    setPreview(null);
    try {
      const r = await scrapeOfferForForm(url);
      if (r.error) {
        setScrapeError(r.error);
        return;
      }
      if (r.price != null && priceRef.current) {
        priceRef.current.value = String(r.price);
      }
      if (r.store && storeRef.current && !storeRef.current.value) {
        storeRef.current.value = r.store;
      }
      if (r.productId && productRef.current) {
        productRef.current.value = r.productId;
      }
      setPreview({ name: r.name ?? null, image: r.image ?? null });
      if (!r.productId) {
        setScrapeError(
          "Produto ainda não está no catálogo — escolha o mais próximo na lista.",
        );
      }
    } catch {
      setScrapeError("Não consegui ler esse link.");
    } finally {
      setScraping(false);
    }
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-emerald-700">
        {state.approved
          ? "Oferta publicada! Já aparece no comparador."
          : "Obrigado! Sua oferta entrou em análise e aparece após a aprovação."}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
    >
      {/* Puxar do link */}
      <div className="space-y-1.5">
        <label htmlFor="url" className="block text-sm font-medium">
          Link da oferta
        </label>
        <div className="flex gap-2">
          <input
            id="url"
            name="url"
            type="url"
            ref={urlRef}
            required
            placeholder="https://loja.com.br/produto/..."
            className={inputClass}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePull}
            disabled={scraping}
            className="shrink-0"
          >
            {scraping ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles className="text-brand" />
            )}
            Puxar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cole o link e preenchemos preço, loja e produto automaticamente.
        </p>
        {scrapeError ? (
          <p className="text-xs text-amber-600">{scrapeError}</p>
        ) : null}
      </div>

      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border bg-brand-soft/40 p-3">
          {preview.image ? (
            <Image
              src={preview.image}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="size-12 shrink-0 rounded-lg object-cover"
            />
          ) : null}
          <div className="min-w-0 text-sm">
            <p className="font-medium text-foreground">Detectado no link</p>
            <p className="truncate text-muted-foreground">
              {preview.name ?? "—"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="productId" className="block text-sm font-medium">
          Produto
        </label>
        <select
          id="productId"
          name="productId"
          ref={productRef}
          required
          defaultValue={defaultProductId}
          className={inputClass}
        >
          <option value="">Selecione um produto…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="storeName" className="block text-sm font-medium">
          Loja
        </label>
        <input
          id="storeName"
          name="storeName"
          ref={storeRef}
          list="stores-list"
          required
          autoComplete="off"
          placeholder="Ex.: 3D Fila, Loja XYZ…"
          className={inputClass}
        />
        <datalist id="stores-list">
          {stores.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Escolha uma loja existente ou digite o nome de uma nova.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="price" className="block text-sm font-medium">
            Preço (R$)
          </label>
          <input
            id="price"
            name="price"
            ref={priceRef}
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="109.90"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="stockStatus" className="block text-sm font-medium">
            Estoque
          </label>
          <select
            id="stockStatus"
            name="stockStatus"
            defaultValue="IN_STOCK"
            className={inputClass}
          >
            <option value="IN_STOCK">Em estoque</option>
            <option value="OUT_OF_STOCK">Sem estoque</option>
            <option value="UNKNOWN">Não informado</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium text-muted-foreground">
          Cupom (opcional)
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="couponCode" className="block text-sm font-medium">
              Código
            </label>
            <input
              id="couponCode"
              name="couponCode"
              placeholder="EX10"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="couponType" className="block text-sm font-medium">
              Tipo
            </label>
            <select
              id="couponType"
              name="couponType"
              defaultValue=""
              className={inputClass}
            >
              <option value="">—</option>
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Fixo (R$)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="couponDiscount" className="block text-sm font-medium">
              Desconto
            </label>
            <input
              id="couponDiscount"
              name="couponDiscount"
              type="number"
              step="0.01"
              min="0"
              placeholder="10"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="authorName" className="block text-sm font-medium">
            Seu nome
          </label>
          <input
            id="authorName"
            name="authorName"
            required
            defaultValue={defaultName}
            autoComplete="name"
            placeholder="Como deve aparecer em 'cadastrado por'"
            className={inputClass}
          />
        </div>
        {!loggedIn ? (
          <div className="space-y-1.5">
            <label htmlFor="authorEmail" className="block text-sm font-medium">
              Seu e-mail
            </label>
            <input
              id="authorEmail"
              name="authorEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className={inputClass}
            />
          </div>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Send />}
        {isAdmin ? "Publicar oferta" : "Enviar para análise"}
      </Button>
    </form>
  );
}
