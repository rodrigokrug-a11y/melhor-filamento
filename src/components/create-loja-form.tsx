"use client";

import { useActionState } from "react";
import { Loader2, Store } from "lucide-react";

import { createSeller } from "@/app/painel/actions";
import { Button } from "@/components/ui/button";

const initialState: { error?: string } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateLojaForm() {
  const [state, formAction, pending] = useActionState(
    createSeller,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border bg-card p-6"
    >
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium">
          Nome da loja
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Minha Loja 3D"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="type" className="block text-sm font-medium">
          Tipo
        </label>
        <select
          id="type"
          name="type"
          defaultValue="RESELLER"
          className={inputClass}
        >
          <option value="RESELLER">Revenda</option>
          <option value="FACTORY">Fabricante</option>
          <option value="MARKETPLACE">Marketplace</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="website" className="block text-sm font-medium">
          Site (opcional)
        </label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://sualoja.com.br"
          className={inputClass}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Store />}
        Criar loja
      </Button>
    </form>
  );
}
