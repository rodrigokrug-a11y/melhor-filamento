import { cookies, headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { applyAffiliate } from "@/lib/affiliate";
import { prisma } from "@/lib/db";
import { REGION_COOKIE, parseRegion } from "@/lib/region";

const SESSION_COOKIE = "mf_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

// Redirecionador rastreável: registra o clique (lead) e manda o usuário para a
// loja com UTMs. Todo clique de saída passa por aqui.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await params;
  const home = new URL("/", request.url);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { seller: { select: { slug: true } } },
  });

  // Oferta inexistente, não aprovada ou esgotada → não vaza link; volta à home.
  if (!offer || offer.status !== "APPROVED" || offer.stockStatus === "OUT_OF_STOCK") {
    return NextResponse.redirect(home, 302);
  }

  const cookieStore = await cookies();
  const headerList = await headers();

  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = crypto.randomUUID();

  const region = parseRegion(cookieStore.get(REGION_COOKIE)?.value);

  // O clique vira um lead. A cobrança/conversão entra depois via
  // ClickEvent.converted — este é o ponto onde o billing seria disparado.
  try {
    await prisma.clickEvent.create({
      data: {
        offerId: offer.id,
        sessionId,
        cep: region?.cep ?? null,
        uf: region?.uf ?? null,
        region: region?.region ?? null,
        referrer: headerList.get("referer"),
        userAgent: headerList.get("user-agent"),
      },
    });
  } catch {
    // Falha no tracking não pode impedir o redirecionamento do usuário.
  }

  // Defesa anti-phishing/open-redirect: só redireciona para http(s) válido.
  let target: URL;
  try {
    target = new URL(offer.url);
  } catch {
    return NextResponse.redirect(home, 302);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.redirect(home, 302);
  }
  target.searchParams.set("utm_source", "melhorfilamento");
  target.searchParams.set("utm_medium", "lead");
  target.searchParams.set("utm_campaign", offer.seller.slug);
  // Monetização por afiliado: reescreve o link da loja se houver regra cadastrada.
  applyAffiliate(target);

  const response = NextResponse.redirect(target, 302);
  if (isNewSession) {
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
