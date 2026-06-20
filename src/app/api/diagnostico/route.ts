import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";

import { clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 90;

const MODEL =
  process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-4-5-20250929";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const PROMPT = `Esta é a foto de uma impressão 3D (FDM ou resina) que pode ter dado problema. Como especialista, faça um diagnóstico em português do Brasil:
1) Identifique o(s) problema(s) visível(is): warping, stringing, sub/superextrusão, camadas separadas/deslocadas, má adesão, elephant foot, ringing/ghosting, falhas de suporte, etc.
2) Para cada problema, dê 1–3 correções práticas (temperatura, velocidade, retração, adesão/mesa, ventilação, nivelamento, fluxo…).
Seja claro e direto. Se a imagem não parecer uma impressão 3D, diga isso gentilmente.

Formate em Markdown: um título "## " por problema identificado, **negrito** nos termos-chave e valores (temperaturas, velocidades) e listas com "- " para as correções.`;

const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Diagnóstico indisponível." }, { status: 503 });
  }
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas análises em pouco tempo. Aguarde um instante." },
      { status: 429 },
    );
  }

  let body: { image?: unknown; mediaType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const image = typeof body.image === "string" ? body.image : "";
  const mediaType = typeof body.mediaType === "string" ? body.mediaType : "";
  if (!image || !ALLOWED.has(mediaType)) {
    return NextResponse.json(
      { error: "Envie uma imagem válida (JPG, PNG, WebP)." },
      { status: 400 },
    );
  }
  if (image.length > 7_500_000) {
    return NextResponse.json(
      { error: "Imagem muito grande (máximo ~5 MB)." },
      { status: 400 },
    );
  }

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: image,
              },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });
    const diagnosis = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({
      diagnosis: diagnosis || "Não consegui analisar a imagem.",
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível analisar agora. Tente de novo." },
      { status: 502 },
    );
  }
}
