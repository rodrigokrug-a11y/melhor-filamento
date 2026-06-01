"use server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { adminNotifyEmails, emailLayout, sendMail } from "@/lib/mailer";

export type RequestState = { ok?: boolean; error?: string };

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Público: registra uma demanda por ofertas de uma marca e avisa o admin. */
export async function createOfferRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const brandId = String(formData.get("brandId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!brandId) return { error: "Marca inválida." };
  if (email && !isEmail(email)) return { error: "E-mail inválido." };

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true, name: true },
  });
  if (!brand) return { error: "Marca não encontrada." };

  const sessionId = (await cookies()).get("mf_session")?.value ?? null;
  await prisma.offerRequest.create({
    data: { brandId, email: email || null, sessionId },
  });

  // Notifica o admin (sem bloquear a resposta).
  const to = adminNotifyEmails();
  if (to.length > 0) {
    void sendMail({
      to,
      subject: `Pedido de ofertas: ${brand.name}`,
      html: emailLayout({
        heading: "Novo pedido de ofertas 🔔",
        intro: `Alguém pediu ofertas da marca <strong>${brand.name}</strong> no comparador.`,
        bodyHtml: email
          ? `<p><strong>Contato:</strong> ${email}</p>`
          : "<p>Sem e-mail informado (anônimo).</p>",
        footnote: "Entre em contato com a marca/loja para cadastrar as ofertas.",
      }),
    }).catch((e) => console.error("[offer-request] notify:", e));
  }

  return { ok: true };
}
