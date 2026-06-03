import type { Metadata } from "next";
import { Check, Mail, Paperclip, RotateCcw, Trash2 } from "lucide-react";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mailerConfigured } from "@/lib/mailer";
import { prisma } from "@/lib/db";

import { deleteMessage, setMessageHandled } from "./actions";

export const metadata: Metadata = {
  title: "Mensagens",
  robots: { index: false },
};

function fmtDate(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminMensagensPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  const smtpOk = mailerConfigured();
  const pending = messages.filter((m) => !m.handled).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Mail className="size-5 text-brand" />
          Mensagens de contato
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.length} no total · {pending} sem resposta. Toda mensagem fica
          salva aqui (mesmo se o e-mail falhar).
        </p>
      </div>

      {!smtpOk ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Atenção:</strong> o envio de e-mail (SMTP) ainda não está
          configurado no servidor — as mensagens são salvas aqui, mas você
          <strong> não recebe</strong> notificação por e-mail. Configure o SMTP
          para receber no seu e-mail.
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma mensagem ainda.
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl border p-4 ${
                m.handled ? "bg-muted/30" : "bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">
                    {m.name}{" "}
                    <a
                      href={`mailto:${m.email}`}
                      className="text-sm font-normal text-teal hover:underline"
                    >
                      &lt;{m.email}&gt;
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(m.createdAt)}
                    {m.subject ? ` · ${m.subject}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {m.handled ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      resolvida
                    </Badge>
                  ) : (
                    <Badge variant="success">nova</Badge>
                  )}
                  {!m.emailed ? (
                    <Badge variant="outline" className="text-amber-600">
                      não enviada por e-mail
                    </Badge>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>

              {m.attachmentId ? (
                <a
                  href={`/api/uploads/${m.attachmentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm text-teal hover:bg-accent"
                >
                  <Paperclip className="size-4" />
                  {m.attachmentName ?? "anexo"}
                </a>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(
                    `Re: ${m.subject || "seu contato"}`,
                  )}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand/90"
                >
                  <Mail className="size-4" />
                  Responder
                </a>
                <form action={setMessageHandled}>
                  <input type="hidden" name="id" value={m.id} />
                  <input
                    type="hidden"
                    name="handled"
                    value={m.handled ? "false" : "true"}
                  />
                  <Button size="sm" variant="outline" type="submit">
                    {m.handled ? <RotateCcw /> : <Check />}
                    {m.handled ? "Reabrir" : "Marcar resolvida"}
                  </Button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmSubmitButton
                    confirmText="Apagar esta mensagem?"
                    variant="outline"
                  >
                    <Trash2 />
                    Apagar
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
