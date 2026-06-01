"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createBrand } from "@/app/admin/produtos/actions";
import { Button } from "@/components/ui/button";

const initialState: { error?: string } = {};

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateBrandForm() {
  const [state, formAction, pending] = useActionState(createBrand, initialState);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border bg-card p-4"
    >
      <input
        name="name"
        required
        placeholder="Nome da marca"
        aria-label="Nome da marca"
        className={inputClass}
      />
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Criar marca
      </Button>
    </form>
  );
}
