"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createProduct } from "@/app/admin/produtos/actions";
import { Button } from "@/components/ui/button";
import { MATERIAL_LABELS } from "@/lib/catalog-types";

const initialState: { error?: string } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const MATERIALS = Object.keys(MATERIAL_LABELS);

export function CreateProductForm({
  brands,
}: {
  brands: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border bg-card p-4"
    >
      <input
        name="name"
        required
        placeholder="Nome do produto"
        aria-label="Nome do produto"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="kind"
          defaultValue="FILAMENT"
          aria-label="Tipo"
          className={inputClass}
        >
          <option value="FILAMENT">Filamento</option>
          <option value="RESIN">Resina</option>
        </select>
        <select
          name="material"
          defaultValue="PLA"
          aria-label="Material"
          className={inputClass}
        >
          {MATERIALS.map((m) => (
            <option key={m} value={m}>
              {MATERIAL_LABELS[m]}
            </option>
          ))}
        </select>
      </div>
      <select
        name="brandId"
        required
        defaultValue=""
        aria-label="Marca"
        className={inputClass}
      >
        <option value="">Selecione a marca…</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-3 gap-3">
        <input
          name="color"
          required
          placeholder="Cor"
          aria-label="Cor"
          className={inputClass}
        />
        <input
          name="netWeightG"
          type="number"
          min="1"
          required
          placeholder="Peso (g)"
          aria-label="Peso em gramas"
          className={inputClass}
        />
        <input
          name="diameterMm"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ø mm"
          aria-label="Diâmetro em mm"
          className={inputClass}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Criar produto
      </Button>
    </form>
  );
}
