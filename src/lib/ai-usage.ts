import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** Ferramentas de IA cujo uso é medido. Espelha o enum AiTool do schema. */
export type AiToolName = "ASSISTENTE" | "DIAGNOSTICO";

/**
 * Exige uma conta para usar a IA.
 *
 * A chamada à API é paga por requisição, então sem porta o custo é aberto a
 * qualquer visitante — e não há a quem atribuir uso nem a quem limitar.
 *
 * Devolve o id do usuário, ou `null` se não houver sessão; a rota responde 401
 * nesse caso.
 */
export async function requireUserForAi(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Registra uma chamada de IA. Guarda só metadados — nunca o texto da pergunta
 * ou da resposta —, o bastante para medir volume, adoção e custo sem virar um
 * arquivo do que os usuários perguntam.
 *
 * Nunca lança: medir uso não pode derrubar a funcionalidade medida.
 */
export async function recordAiUsage(args: {
  tool: AiToolName;
  userId: string | null;
  ok: boolean;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
}): Promise<void> {
  try {
    await prisma.aiUsage.create({
      data: {
        tool: args.tool,
        userId: args.userId,
        ok: args.ok,
        inputTokens: args.inputTokens ?? 0,
        outputTokens: args.outputTokens ?? 0,
        latencyMs: args.latencyMs ?? 0,
      },
    });
  } catch {
    // Falha ao registrar não pode quebrar a resposta ao usuário.
  }
}
