"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createSource } from "@/app/admin/fontes/actions";
import { Button } from "@/components/ui/button";

const initialState: { error?: string } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateSourceForm({
  sellers,
}: {
  sellers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createSource,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border bg-card p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select name="sellerId" required defaultValue="" className={inputClass}>
          <option value="">Loja…</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="kind" defaultValue="PAGE" className={inputClass}>
          <option value="PAGE">Página de produto</option>
          <option value="SITEMAP">Sitemap (catálogo)</option>
          <option value="FEED">Feed XML/CSV</option>
        </select>
      </div>
      <input
        name="url"
        type="url"
        required
        placeholder="https://loja.com.br/produto/... ou .../feed.xml"
        aria-label="URL da fonte"
        className={inputClass}
      />
      <input
        name="label"
        placeholder="Rótulo (opcional)"
        aria-label="Rótulo"
        className={inputClass}
      />
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Adicionar fonte
      </Button>
    </form>
  );
}
