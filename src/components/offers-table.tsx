"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Megaphone, Trash2 } from "lucide-react";

import {
  bulkUpdateOffers,
  deleteOffers,
  updateOfferPrice,
} from "@/app/admin/anuncios/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  productName: string;
  sellerName: string;
  price: number;
  status: string;
  isSponsored: boolean;
};

export function OffersTable({ offers }: { offers: Row[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const allSel = offers.length > 0 && sel.size === offers.length;

  function toggle(id: string) {
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSel(allSel ? new Set() : new Set(offers.map((o) => o.id)));
  }

  function bulk(patch: { status?: "APPROVED" | "PENDING"; isSponsored?: boolean }) {
    if (sel.size === 0) return;
    const ids = [...sel];
    start(async () => {
      await bulkUpdateOffers(ids, patch);
      setSel(new Set());
      router.refresh();
    });
  }

  function savePrice(id: string, raw: string, current: number) {
    const n = Number(raw.replace(/[^\d,.-]/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n <= 0 || n === current) return;
    start(async () => {
      await updateOfferPrice(id, n);
      router.refresh();
    });
  }

  function del() {
    if (sel.size === 0) return;
    if (
      !window.confirm(
        `Excluir ${sel.size} anúncio(s) definitivamente? Não dá para desfazer.`,
      )
    )
      return;
    const ids = [...sel];
    start(async () => {
      await deleteOffers(ids);
      setSel(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {sel.size > 0 ? (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-md">
          <span className="px-2 text-sm font-medium">
            {sel.size} selecionado(s):
          </span>
          <Button size="sm" onClick={() => bulk({ status: "APPROVED" })} disabled={pending}>
            <Eye className="size-4" />
            Tornar visível
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulk({ status: "PENDING" })} disabled={pending}>
            <EyeOff className="size-4" />
            Ocultar
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulk({ isSponsored: true })} disabled={pending}>
            <Megaphone className="size-4" />
            Patrocinar
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulk({ isSponsored: false })} disabled={pending}>
            Despatrocinar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={del}
            disabled={pending}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
          {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSel}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                  className="size-4 accent-brand"
                />
              </th>
              <th className="px-3 py-2 font-medium">Produto</th>
              <th className="px-3 py-2 font-medium">Loja</th>
              <th className="px-3 py-2 font-medium">Preço (R$)</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Patroc.</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {offers.map((o) => (
              <tr key={o.id} className={cn(sel.has(o.id) && "bg-accent")}>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={sel.has(o.id)}
                    onChange={() => toggle(o.id)}
                    aria-label={`Selecionar ${o.productName}`}
                    className="size-4 accent-brand"
                  />
                </td>
                <td className="px-3 py-2 font-medium">{o.productName}</td>
                <td className="px-3 py-2 text-muted-foreground">{o.sellerName}</td>
                <td className="px-3 py-2">
                  <input
                    defaultValue={o.price.toFixed(2)}
                    inputMode="decimal"
                    onBlur={(e) => savePrice(o.id, e.target.value, o.price)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 tnum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </td>
                <td className="px-3 py-2">
                  {o.status === "APPROVED" ? (
                    <span className="text-emerald-700 dark:text-emerald-400">visível</span>
                  ) : o.status === "PENDING" ? (
                    <span className="text-amber-600">pendente</span>
                  ) : (
                    <span className="text-muted-foreground">rejeitado</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {o.isSponsored ? (
                    <Megaphone className="size-4 text-brand" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{offers.length} anúncios.</p>
    </div>
  );
}
