import { NextResponse, type NextRequest } from "next/server";

import { runAllSources } from "@/lib/ingest/run";

// Dispara a ingestão de todas as fontes ativas. Protegido por segredo
// (header `x-ingest-secret`) — pensado para um cron externo.
export const runtime = "nodejs";

// Raspar dezenas de páginas por fonte não cabe no timeout padrão. 120s é o
// teto já em uso em /api/alertas/check; se o plano do provedor permitir mais,
// dá para subir aqui e em INGEST_DEADLINE_MS junto.
export const maxDuration = 120;

// Encerra a ingestão antes do timeout da plataforma, para que a resposta
// ainda seja gravada e as fontes não rodadas apareçam como `skipped`.
const INGEST_DEADLINE_MS = 105_000;

export async function POST(request: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  const provided =
    request.headers.get("x-ingest-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await runAllSources({ deadlineMs: INGEST_DEADLINE_MS });
  return NextResponse.json({ ok: true, ...result });
}
