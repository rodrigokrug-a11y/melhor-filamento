import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

function csvCell(value: string | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Exporta os leads em CSV (somente admin). BOM para abrir bem no Excel pt-BR. */
export async function GET() {
  await requireAdmin();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      offer: {
        include: {
          product: { select: { name: true } },
          seller: { select: { name: true } },
        },
      },
    },
  });

  const header = ["data", "nome", "email", "produto", "loja", "offerId", "sessao"];
  const rows = leads.map((l) =>
    [
      l.createdAt.toISOString(),
      l.name,
      l.email,
      l.offer?.product.name ?? "",
      l.offer?.seller.name ?? "",
      l.offerId ?? "",
      l.sessionId ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="leads-melhorfilamento.csv"',
      "cache-control": "no-store",
    },
  });
}
