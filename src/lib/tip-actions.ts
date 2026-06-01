"use server";

import { z } from "zod";

import { prisma } from "@/lib/db";

type State = { error?: string; ok?: boolean };

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "ASA", "PCTG", "NYLON"] as const;

const TipSchema = z.object({
  material: z.enum(MATERIALS),
  nozzleTempC: z.coerce.number().int().positive().optional(),
  bedTempC: z.coerce.number().int().nonnegative().optional(),
  speedMms: z.coerce.number().int().positive().optional(),
  notes: z.string().trim().min(5, "Escreva a dica (mín. 5 caracteres)."),
  authorName: z.string().trim().min(2, "Informe seu nome."),
  authorEmail: z.string().trim().optional(),
});

export async function submitTip(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const parsed = TipSchema.safeParse({
    material: formData.get("material"),
    nozzleTempC: formData.get("nozzleTempC") || undefined,
    bedTempC: formData.get("bedTempC") || undefined,
    speedMms: formData.get("speedMms") || undefined,
    notes: formData.get("notes"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  await prisma.tip.create({
    data: {
      material: d.material,
      nozzleTempC: d.nozzleTempC ?? null,
      bedTempC: d.bedTempC ?? null,
      speedMms: d.speedMms ?? null,
      notes: d.notes,
      authorName: d.authorName,
      authorEmail: d.authorEmail?.trim() || null,
      status: "PENDING",
    },
  });

  return { ok: true };
}
