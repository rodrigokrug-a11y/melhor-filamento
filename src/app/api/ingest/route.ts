import { NextResponse, type NextRequest } from "next/server";

import { runAllSources } from "@/lib/ingest/run";

// Dispara a ingestão de todas as fontes ativas. Protegido por segredo
// (header `x-ingest-secret`) — pensado para um cron externo.
export async function POST(request: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  const provided =
    request.headers.get("x-ingest-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await runAllSources();
  return NextResponse.json({ ok: true, ...result });
}
