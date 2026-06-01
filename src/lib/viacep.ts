import { z } from "zod";

// ViaCEP responde { cep, localidade, uf, ... } ou { erro: true } quando não acha.
const ViaCepSchema = z.object({
  cep: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.union([z.boolean(), z.string()]).optional(),
});

export type ViaCepResult = { cep: string; uf: string; localidade: string };

const cache = new Map<string, ViaCepResult>();

export function normalizeCep(input: string): string {
  return input.replace(/\D/g, "");
}

export async function lookupCep(rawCep: string): Promise<ViaCepResult> {
  const cep = normalizeCep(rawCep);
  if (cep.length !== 8) {
    throw new Error("CEP inválido. Digite os 8 números.");
  }

  const cached = cache.get(cep);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  } catch {
    throw new Error("Não foi possível consultar o CEP. Tente novamente.");
  }
  if (!res.ok) throw new Error("Não foi possível consultar o CEP.");

  const parsed = ViaCepSchema.safeParse(await res.json());
  if (!parsed.success) throw new Error("Resposta inesperada do ViaCEP.");

  const data = parsed.data;
  if (data.erro || !data.uf || !data.localidade) {
    throw new Error("CEP não encontrado.");
  }

  const result: ViaCepResult = {
    cep,
    uf: data.uf.toUpperCase(),
    localidade: data.localidade,
  };
  cache.set(cep, result);
  return result;
}
