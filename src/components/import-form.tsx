"use client";

import { useActionState } from "react";
import { Download, Loader2 } from "lucide-react";

import { importFromUrl } from "@/app/admin/importar/actions";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

type ImportState = Awaited<ReturnType<typeof importFromUrl>>;
const initialState: ImportState = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ImportForm({
  sellers,
}: {
  sellers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    importFromUrl,
    initialState,
  );

  return (
    <div className="space-y-4">
      <form
        action={formAction}
        className="space-y-3 rounded-xl border bg-card p-4"
      >
        <select name="sellerId" required defaultValue="" className={inputClass}>
          <option value="">Loja…</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          name="url"
          type="url"
          required
          placeholder="https://loja.com.br/produto/..."
          aria-label="URL do produto"
          className={inputClass}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Loader2 className="animate-spin" /> : <Download />}
          Importar do link
        </Button>
      </form>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-emerald-600">{state.message}</p>
      ) : null}

      {state.preview ? (
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Extraído ({state.preview.source})
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-muted-foreground">Nome</dt>
            <dd className="font-medium">{state.preview.name ?? "—"}</dd>
            <dt className="text-muted-foreground">Preço</dt>
            <dd className="font-medium">
              {state.preview.price != null
                ? formatBRL(state.preview.price)
                : "—"}
            </dd>
            <dt className="text-muted-foreground">Produto</dt>
            <dd className="font-medium">{state.preview.product ?? "—"}</dd>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
