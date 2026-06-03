import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { emailLayout, sendMail } from "@/lib/mailer";
import { type CouponType, effectivePrice } from "@/lib/pricing";
import { formatBRL } from "@/lib/utils";

// Checagem de alertas de preço (protegida por INGEST_SECRET). Pensada para
// rodar logo após a ingestão de preços (mesmo cron). Notifica e desativa.
export const runtime = "nodejs";
export const maxDuration = 120;

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://melhorfilamento.com.br";

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

async function run(req: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  const given =
    req.headers.get("x-ingest-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (!secret || given !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { active: true },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          offers: {
            where: {
              status: "APPROVED",
              stockStatus: { not: "OUT_OF_STOCK" },
            },
            select: { price: true, couponType: true, couponDiscount: true },
          },
        },
      },
    },
  });

  let notified = 0;
  for (const a of alerts) {
    const offers = a.product.offers;
    if (offers.length === 0) continue;
    let best = Infinity;
    for (const o of offers) {
      const eff = effectivePrice({
        price: Number(o.price),
        couponType: o.couponType as CouponType | null,
        couponDiscount: o.couponDiscount != null ? Number(o.couponDiscount) : null,
      });
      if (eff < best) best = eff;
    }
    if (best <= Number(a.targetPrice)) {
      try {
        await sendMail({
          to: a.email,
          subject: `🔔 Baixou! ${a.product.name} por ${formatBRL(best)}`,
          html: emailLayout({
            heading: "O preço baixou! 🎉",
            intro: `<strong>${esc(a.product.name)}</strong> está agora por <strong>${formatBRL(best)}</strong> — abaixo do seu alerta de ${formatBRL(Number(a.targetPrice))}.`,
            ctaLabel: "Ver a oferta",
            ctaUrl: `${SITE}/produto/${a.product.slug}`,
            footnote: "Este alerta foi concluído. Crie outro na página do produto quando quiser.",
          }),
        });
        await prisma.priceAlert.update({
          where: { id: a.id },
          data: { active: false, lastNotifiedAt: new Date() },
        });
        notified += 1;
      } catch {
        // segue para os próximos
      }
    }
  }

  return NextResponse.json({ ok: true, checked: alerts.length, notified });
}

export const GET = run;
export const POST = run;
