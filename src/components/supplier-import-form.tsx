"use client";

import { useActionState, useRef } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";

import { importSuppliers, type ImportState } from "@/app/admin/fornecedores/actions";
import { Button } from "@/components/ui/button";

export function SupplierImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(
    importSuppliers,
    {},
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !textareaRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (textareaRef.current) textareaRef.current.value = String(reader.result);
    };
    reader.readAsText(file);
  }

  const s = state.summary;

  return (
    <form action={action} className="mt-5 space-y-3">
      <textarea
        ref={textareaRef}
        name="json"
        rows={14}
        spellCheck={false}
        placeholder={'{ "suppliers": [ { "name": "3D Lab", "website": "https://3dlab.com.br", "type": "FABRICANTE", ... } ] }'}
        className="w-full rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          Importar fornecedores
        </Button>

        <label className="cursor-pointer text-sm text-brand hover:underline">
          ou selecionar arquivo .json
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {pending ? (
          <span className="text-xs text-muted-foreground">
            Importando e geocodificando… pode levar um tempo em listas grandes.
          </span>
        ) : null}
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>

      {state.ok && s ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            Importação concluída
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <li>Lojas criadas: <strong>{s.sellersCreated}</strong></li>
            <li>Lojas atualizadas: <strong>{s.sellersUpdated}</strong></li>
            <li>Marcas criadas: <strong>{s.brandsCreated}</strong></li>
            <li>Feeds criados: <strong>{s.feedsCreated}</strong></li>
            <li>Geocodificadas: <strong>{s.geocoded}</strong></li>
          </ul>
          {s.warnings.length > 0 ? (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-amber-600">
                {s.warnings.length} aviso(s)
              </summary>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                {s.warnings.slice(0, 30).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
