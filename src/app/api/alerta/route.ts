import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { emailLayout, sendMail } from "@/lib/mailer";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { formatBRL } from "@/lib/utils";

export const runtime = "nodejs";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://melhorfilamento.com.br";

const Schema = z.object({
  email: z.string().trim().toLowerCase().max(160),
  productId: z.string().min(1).max(60),
  targetPrice: z.coerce.number().positive().max(1_000_000),
});

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

export async function POST(req: NextRequest) {
  if (rateLimit(`alerta:ip:${clientIp(req)}`, 6, 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success || !isEmail(parsed.data.email)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { email, productId, targetPrice } = parsed.data;

  // Anti email-bomb: no máx. 3 alertas por endereço por hora (mandamos e-mail
  // de confirmação pra esse endereço — não pode virar relay de spam).
  if (rateLimit(`alerta:email:${email}`, 3, 3_600_000)) return tooMany();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true },
  });
  if (!product) {
    return NextResponse.json(
      { error: "Produto não encontrado." },
      { status: 404 },
    );
  }

  const token = randomUUID();
  await prisma.priceAlert.create({
    data: { productId, email, targetPrice: targetPrice.toFixed(2), token },
  });

  try {
    await sendMail({
      to: email,
      subject: `Alerta de preço criado — ${product.name}`,
      html: emailLayout({
        heading: "Alerta de preço criado ✅",
        intro: `Vamos te avisar assim que <strong>${esc(product.name)}</strong> ficar <strong>abaixo de ${formatBRL(targetPrice)}</strong>.`,
        ctaLabel: "Ver o produto",
        ctaUrl: `${SITE}/produto/${product.slug}`,
        footnote: `Não quer mais? <a href="${SITE}/api/alertas/cancelar?token=${token}">Cancelar este alerta</a>.`,
      }),
    });
  } catch {
    // não quebra: o alerta já está salvo
  }

  return NextResponse.json({ ok: true });
}
