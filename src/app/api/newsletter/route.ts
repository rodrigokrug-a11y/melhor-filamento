import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

// Inscrição opt-in na newsletter de ofertas. Captação NÃO-bloqueante: não
// libera/condiciona nenhum conteúdo, só registra quem quer receber ofertas.
// Armazenada como Lead (sem oferta) para reaproveitar o painel de leads.
const Schema = z.object({ email: z.string().trim().toLowerCase() });

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success || !isEmail(parsed.data.email)) {
    return NextResponse.json(
      { error: "Informe um e-mail válido." },
      { status: 400 },
    );
  }

  const email = parsed.data.email;
  const sessionId = request.cookies.get("mf_session")?.value ?? null;

  // Dedup: não duplica a inscrição (lead sem oferta com o mesmo e-mail).
  const existing = await prisma.lead.findFirst({
    where: { email, offerId: null },
    select: { id: true },
  });
  if (!existing) {
    const namePart = email.split("@")[0]?.slice(0, 60) || "assinante";
    await prisma.lead.create({
      data: { name: namePart, email, offerId: null, sessionId },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("mf_news", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
