"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Por que minha peça está com warping?",
  "PLA ou PETG para peças funcionais?",
  "Como melhorar a adesão da primeira camada?",
  "Dá pra imprimir ABS sem caixa fechada?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Não foi possível responder.");
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-card">
      <div className="min-h-[300px] space-y-4 p-4 sm:p-5">
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Sparkles className="size-6" />
            </span>
            <p className="mt-3 font-medium">Pergunte qualquer coisa sobre impressão 3D</p>
            <p className="text-sm text-muted-foreground">
              Materiais, configurações, troubleshooting…
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "bg-brand-soft text-brand"
                }`}
              >
                {m.role === "user" ? (
                  <User className="size-4" />
                ) : (
                  <Bot className="size-4" />
                )}
              </span>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Pensando…
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua dúvida…"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
          className="flex size-10 items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
      <p className="px-4 pb-3 text-xs text-muted-foreground">
        Respostas geradas por IA — podem conter erros. Confira informações
        críticas.
      </p>
    </div>
  );
}
