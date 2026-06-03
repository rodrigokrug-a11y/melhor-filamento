import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

const SYSTEM = `Você é o assistente do Melhor Filamento (melhorfilamento.com.br), um comparador de preços e guia de impressão 3D no Brasil.
Ajude com dúvidas de impressão 3D: filamentos (PLA, PETG, ABS, ASA, TPU, Nylon, PCTG), resinas, impressoras, configurações de fatiador (temperatura, velocidade, retração, adesão) e troubleshooting (warping, stringing, sub/superextrusão, primeira camada, entupimento).
Responda em português do Brasil, de forma clara, prática e concisa. Quando fizer sentido, sugira usar o catálogo, o comparador e as ferramentas do site. Não invente preços específicos. Se a pergunta fugir de impressão 3D, redirecione gentilmente.

Formate a resposta em Markdown: use **negrito** para termos-chave e valores (temperaturas, velocidades), listas com "- " para passos ou opções, "1." para sequências ordenadas e \`código\` para nomes de parâmetros do fatiador. Em respostas longas, use títulos curtos com "## ". Mantenha parágrafos curtos.`;

// Rate-limit simples por IP (memória do processo) — barreira contra abuso/custo.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 15, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Assistente indisponível." }, { status: 503 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas mensagens em pouco tempo. Aguarde um instante." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const raw = (body as { messages?: unknown })?.messages;
  const messages: Msg[] = (Array.isArray(raw) ? raw : [])
    .filter(
      (m): m is Msg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 900,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages,
    });
    const reply = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({
      reply: reply || "Desculpe, não consegui responder agora.",
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível falar com a IA agora. Tente de novo." },
      { status: 502 },
    );
  }
}
