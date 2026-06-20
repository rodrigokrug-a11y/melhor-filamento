"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type State = { error?: string; ok?: boolean };

const SignupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(60),
  email: z.string().trim().toLowerCase().email("E-mail inválido.").max(160),
  password: z
    .string()
    .min(6, "A senha precisa de pelo menos 6 caracteres.")
    .max(100),
});

/** Cria uma conta de comprador (CLIENTE) com senha. O login é feito no cliente. */
export async function createBuyerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<State> {
  const ip = (await headers()).get("x-real-ip") ?? "unknown";
  if (rateLimit(`signup:${ip}`, 5, 600_000)) {
    return { error: "Muitas tentativas. Tente novamente mais tarde." };
  }

  const parsed = SignupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.passwordHash) {
      return {
        error: "Já existe uma conta com esse e-mail. Faça login.",
      };
    }
    // Conta criada antes via magic link, sem senha: define a senha agora.
    await prisma.user.update({
      where: { email },
      data: { passwordHash, name: existing.name ?? name },
    });
    return { ok: true };
  }

  await prisma.user.create({
    data: { email, name, passwordHash, role: "CLIENTE" },
  });
  return { ok: true };
}
