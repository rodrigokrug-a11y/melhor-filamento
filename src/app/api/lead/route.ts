import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { adminNotifyEmails, emailLayout, sendMail } from "@/lib/mailer";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().max(160),
  offerId: z.string().max(60).optional(),
});

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

/** Notifica o admin (e a loja dona da oferta, se houver) sobre um novo lead. */
async function notifyNewLead(lead: {
  name: string;
  email: string;
  offerId: string | null;
}): Promise<void> {
  const recipients = new Set(adminNotifyEmails());
  let context = "";
  if (lead.offerId) {
    const offer = await prisma.offer.findUnique({
      where: { id: lead.offerId },
      include: {
        product: { select: { name: true } },
        seller: { select: { name: true, owner: { select: { email: true } } } },
      },
    });
    if (offer) {
      context = `<p><strong>Interesse:</strong> ${esc(offer.product.name)} — ${esc(offer.seller.name)}</p>`;
      if (offer.seller.owner?.email) {
        recipients.add(offer.seller.owner.email.toLowerCase());
      }
    }
  }
  if (recipients.size === 0) return;
  await sendMail({
    to: [...recipients],
    subject: `Novo lead: ${lead.name}`,
    html: emailLayout({
      heading: "Novo lead capturado 🎯",
      intro: `${esc(lead.name)} demonstrou interesse e deixou contato.`,
      bodyHtml: `<p><strong>E-mail:</strong> ${esc(lead.email)}</p>${context}`,
      footnote: "Lead capturado automaticamente no Melhor Filamento.",
    }),
  });
}

export async function POST(request: NextRequest) {
  if (rateLimit(`lead:${clientIp(request)}`, 8, 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success || !isEmail(parsed.data.email)) {
    return NextResponse.json(
      { error: "Informe um nome e um e-mail válidos." },
      { status: 400 },
    );
  }

  const sessionId = request.cookies.get("mf_session")?.value ?? null;

  let offerId = parsed.data.offerId ?? null;
  if (offerId) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true },
    });
    if (!offer) offerId = null;
  }

  await prisma.lead.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      offerId,
      sessionId,
    },
  });

  // Notifica admin/loja sem bloquear a resposta ao visitante.
  void notifyNewLead({
    name: parsed.data.name,
    email: parsed.data.email,
    offerId,
  }).catch((e) => console.error("[lead] falha ao notificar:", e));

  const response = NextResponse.json({ ok: true });
  // Cookie legível pelo cliente: evita pedir os dados de novo a cada clique.
  response.cookies.set("mf_lead", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
