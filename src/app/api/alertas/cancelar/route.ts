import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://melhorfilamento.com.br";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  let ok = false;
  if (token) {
    const r = await prisma.priceAlert.updateMany({
      where: { token },
      data: { active: false },
    });
    ok = r.count > 0;
  }
  const title = ok ? "✅ Alerta cancelado" : "Alerta não encontrado";
  const msg = ok
    ? "Você não receberá mais e-mails sobre este produto."
    : "Pode ser que ele já tenha sido cancelado ou concluído.";
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alerta de preço</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:48px 16px;text-align:center;color:#0f172a"><div style="max-width:420px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px"><h1 style="font-size:20px;margin:0 0 8px">${title}</h1><p style="color:#475569;font-size:15px;margin:0 0 20px">${msg}</p><a href="${SITE}" style="display:inline-block;background:#0E7E7B;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">Voltar ao Melhor Filamento</a></div></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
