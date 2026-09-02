import { NextResponse, type NextRequest } from "next/server";

import { applyRebrand, groupChanges, planRebrand } from "@/lib/ingest/rebrand";

/**
 * Reclassifica a marca dos produtos já salvos. Protegido pelo mesmo segredo da
 * ingestão (header `x-ingest-secret`), pensado para ser chamado do servidor.
 *
 * Sem `?aplicar=1` a rota é SÓ LEITURA: devolve o plano de trocas para
 * conferência. Escrever a marca de centenas de produtos de uma vez não pode
 * acontecer por acidente de digitação.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  const provided =
    request.headers.get("x-ingest-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const aplicar = request.nextUrl.searchParams.get("aplicar") === "1";
  const plan = await planRebrand();
  const grupos = groupChanges(plan.changes);

  if (!aplicar) {
    return NextResponse.json({
      ok: true,
      aplicado: false,
      marcasConhecidas: plan.knownBrands,
      produtos: plan.products,
      mudariam: plan.changes.length,
      grupos,
    });
  }

  const { applied, skipped } = await applyRebrand(plan.changes);
  return NextResponse.json({
    ok: true,
    aplicado: true,
    marcasConhecidas: plan.knownBrands,
    produtos: plan.products,
    trocados: applied,
    pulados: skipped,
    grupos,
  });
}
