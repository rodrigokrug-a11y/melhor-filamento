"use client";

import { useState } from "react";
import { CircleCheck, Loader2, Paperclip, Send } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/contato", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível enviar. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CircleCheck className="mx-auto size-10 text-emerald-500" />
        <h2 className="mt-3 text-lg font-semibold">Mensagem enviada!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Obrigado pelo contato. Vamos responder no seu e-mail em breve.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border bg-card p-5 sm:p-6"
    >
      {/* Honeypot anti-spam (oculto para humanos). */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nome
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder="Seu nome"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            className={inputClass}
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Assunto (opcional)
        <input
          name="subject"
          maxLength={160}
          className={inputClass}
          placeholder="Sobre o que você quer falar?"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Mensagem
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={5000}
          rows={6}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Escreva sua mensagem…"
        />
      </label>

      <div className="flex flex-col gap-1.5 text-sm font-medium">
        Anexo (opcional)
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-fit max-w-full cursor-pointer",
          )}
        >
          <Paperclip />
          <span className="truncate">
            {fileName ?? "Anexar imagem ou documento"}
          </span>
          <input
            type="file"
            name="attachment"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.odt"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <span className="text-xs font-normal text-muted-foreground">
          Imagens, PDF, DOC, TXT ou planilha — até 8 MB.
        </span>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Send />}
        {loading ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
