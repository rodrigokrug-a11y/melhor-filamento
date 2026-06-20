// Envio de e-mail centralizado.
// - Em produção: usa SMTP (EMAIL_SERVER como DSN, ou variáveis SMTP_* discretas).
// - Sem SMTP (dev): imprime no console em vez de enviar — nunca quebra o fluxo.
// As credenciais vêm SEMPRE do ambiente; nada é hardcoded.

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

type MailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://melhorfilamento.com.br";

/** Monta o DSN SMTP a partir de EMAIL_SERVER (DSN completo) ou de SMTP_* discretas. */
function smtpServer(): string | null {
  if (process.env.EMAIL_SERVER) return process.env.EMAIL_SERVER;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = process.env.SMTP_PORT ?? "587";
  const secure = process.env.SMTP_SECURE === "true" || port === "465";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ?? "";
  const auth = user
    ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
    : "";
  return `${secure ? "smtps" : "smtp"}://${auth}${host}:${port}`;
}

/** true quando há SMTP configurado (envio real disponível). */
export function mailerConfigured(): boolean {
  return smtpServer() !== null;
}

/** Remetente padrão (sobrescreva com EMAIL_FROM). */
export function emailFrom(): string {
  return (
    process.env.EMAIL_FROM ??
    "Melhor Filamento <no-reply@melhorfilamento.com.br>"
  );
}

/** E-mails do admin para notificações internas (ADMIN_EMAILS). */
export function adminNotifyEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sendMail(input: MailInput): Promise<void> {
  const server = smtpServer();
  const text = input.text ?? stripHtml(input.html);
  if (!server) {
    const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;
    const att = input.attachments?.length
      ? ` (+${input.attachments.length} anexo(s))`
      : "";
    console.log(
      `\n[mail] (SMTP não configurado) Para: ${to}${att}\nAssunto: ${input.subject}\n${text}\n`,
    );
    return;
  }
  const { createTransport } = await import("nodemailer");
  const transport = createTransport(server);
  await transport.sendMail({
    from: emailFrom(),
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text,
    html: input.html,
    attachments: input.attachments,
  });
}

/**
 * Layout de e-mail responsivo, com estilos inline (compatível com a maioria dos
 * clientes). Identidade atual da marca: teal #0E7E7B + verde #54B62E + navy.
 */
export function emailLayout(opts: {
  heading: string;
  intro: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const brand = "#0E7E7B"; // teal da marca
  const green = "#54B62E";
  const navy = "#0C1F23";
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<tr><td style="padding:12px 0 4px"><a href="${opts.ctaUrl}" style="display:inline-block;background:${brand};color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border-radius:10px;font-size:15px">${opts.ctaLabel}</a></td></tr>`
      : "";
  const body = opts.bodyHtml
    ? `<tr><td style="padding:6px 0 0;color:#334155;font-size:15px;line-height:1.6">${opts.bodyHtml}</td></tr>`
    : "";
  const footnote = opts.footnote
    ? `<p style="margin:18px 0 0;color:#94a3b8;font-size:13px;line-height:1.5">${opts.footnote}</p>`
    : "";
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <tr><td style="height:5px;background:${brand};background:linear-gradient(90deg,${brand},${green})"></td></tr>
        <tr><td style="padding:26px 28px 24px">
          <a href="${SITE_URL}" style="text-decoration:none;color:${navy};font-weight:700;font-size:18px">Melhor<span style="color:${brand}">Filamento</span></a>
          <h1 style="margin:18px 0 8px;font-size:20px;line-height:1.3;color:${navy}">${opts.heading}</h1>
          <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">${opts.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0">${body}${cta}</table>
          ${footnote}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;color:#94a3b8;font-size:12px">© Melhor Filamento — comparador de preços para impressão 3D no Brasil.</p>
    </td></tr>
  </table>
</body></html>`;
}
