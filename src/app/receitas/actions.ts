"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "ASA", "PCTG", "NYLON"] as const;

const Schema = z.object({
  material: z.enum(MATERIALS),
  printer: z.string().trim().min(2, "Informe a impressora.").max(80),
  nozzleTempC: z.coerce.number().int().min(150).max(350),
  bedTempC: z.coerce.number().int().min(0).max(150),
  speedMms: z.coerce.number().int().min(1).max(1000).optional(),
  retractionMm: z.coerce.number().min(0).max(20).optional(),
  flowPct: z.coerce.number().int().min(50).max(150).optional(),
  fanPct: z.coerce.number().int().min(0).max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  authorName: z.string().trim().min(2, "Informe seu nome.").max(60),
  authorEmail: z.string().trim().optional(),
});

type State = { ok?: boolean; error?: string };

function opt(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s === "" ? undefined : s;
}

export async function submitRecipe(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const parsed = Schema.safeParse({
    material: formData.get("material"),
    printer: formData.get("printer"),
    nozzleTempC: formData.get("nozzleTempC"),
    bedTempC: formData.get("bedTempC"),
    speedMms: opt(formData.get("speedMms")),
    retractionMm: opt(formData.get("retractionMm")),
    flowPct: opt(formData.get("flowPct")),
    fanPct: opt(formData.get("fanPct")),
    notes: opt(formData.get("notes")),
    authorName: formData.get("authorName"),
    authorEmail: opt(formData.get("authorEmail")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  await prisma.recipe.create({
    data: {
      material: d.material,
      printer: d.printer,
      nozzleTempC: d.nozzleTempC,
      bedTempC: d.bedTempC,
      speedMms: d.speedMms ?? null,
      retractionMm: d.retractionMm ?? null,
      flowPct: d.flowPct ?? null,
      fanPct: d.fanPct ?? null,
      notes: d.notes ?? null,
      authorName: d.authorName,
      authorEmail: d.authorEmail ?? null,
    },
  });
  revalidatePath("/receitas");
  return { ok: true };
}
