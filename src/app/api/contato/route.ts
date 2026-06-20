import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  adminNotifyEmails,
  emailLayout,
  mailerConfigured,
  sendMail,
} from "@/lib/mailer";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://melhorfilamento.com.br";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.text",
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  if (rateLimit(`contato:${clientIp(req)}`, 5, 60_000)) return tooMany();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot: bots preenchem campos ocultos. Fingimos sucesso e descartamos.
  if (String(form.get("website") ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 160);
  const subject = String(form.get("subject") ?? "").trim().slice(0, 160);
  const message = String(form.get("message") ?? "").trim().slice(0, 5000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Informe um e-mail válido." },
      { status: 400 },
    );
  }
  if (message.length < 5) {
    return NextResponse.json(
      { error: "Escreva sua mensagem." },
      { status: 400 },
    );
  }

  // Anexo opcional.
  let attachmentId: string | null = null;
  let attachmentName: string | null = null;
  let attachmentBuffer: Buffer | null = null;
  let attachmentType: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Anexo muito grande (máximo 8 MB)." },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de anexo não permitido (imagens, PDF, DOC, TXT, planilhas)." },
        { status: 400 },
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    attachmentBuffer = bytes;
    attachmentType = file.type;
    attachmentName = (file.name || "anexo").slice(0, 200);
    const up = await prisma.upload.create({
      data: { mimeType: file.type, data: bytes },
      select: { id: true },
    });
    attachmentId = up.id;
  }

  // Salva sempre (mesmo sem SMTP, nada se perde).
  const rec = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject: subject || null,
      message,
      attachmentId,
      attachmentName,
    },
    select: { id: true },
  });

  // Notifica o admin por e-mail (com anexo e replyTo para o remetente).
  let emailed = false;
  try {
    const admins = adminNotifyEmails();
    if (admins.length > 0) {
      await sendMail({
        to: admins,
        replyTo: email,
        subject: `Contato: ${subject || "(sem assunto)"} — ${name}`,
        html: emailLayout({
          heading: "Nova mensagem de contato",
          intro: `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt; enviou uma mensagem pelo site.`,
          bodyHtml: `${
            subject ? `<strong>Assunto:</strong> ${escapeHtml(subject)}<br><br>` : ""
          }${escapeHtml(message).replace(/\n/g, "<br>")}`,
          footnote: attachmentName
            ? `Anexo: ${escapeHtml(attachmentName)} (em anexo neste e-mail).`
            : undefined,
          ctaLabel: "Ver no painel",
          ctaUrl: `${SITE}/admin/mensagens`,
        }),
        attachments:
          attachmentBuffer && attachmentName
            ? [
                {
                  filename: attachmentName,
                  content: attachmentBuffer,
                  contentType: attachmentType ?? undefined,
                },
              ]
            : undefined,
      });
      emailed = mailerConfigured();
    }
  } catch {
    // Não quebra: a mensagem já está salva no banco para o admin ver.
  }

  if (emailed) {
    await prisma.contactMessage.update({
      where: { id: rec.id },
      data: { emailed: true },
    });
  }

  return NextResponse.json({ ok: true });
}
