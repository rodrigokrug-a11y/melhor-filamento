import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * Papéis de usuário. ADMIN não está aqui de propósito: é decidido por e-mail
 * (ADMIN_EMAILS), nunca atribuível pelo painel. Ver also [[project-melhorfilamento]].
 */
export type AppRole = "CLIENTE" | "LOJA" | "MODERADOR";

export const ROLE_LABEL: Record<AppRole, string> = {
  CLIENTE: "Cliente",
  LOJA: "Loja cadastrada",
  MODERADOR: "Moderador",
};

export type Viewer = {
  id: string | null;
  email: string | null;
  role: AppRole;
  isAdmin: boolean;
};

/** Snapshot de quem está logado (papel + admin), para checagens de permissão. */
export async function getViewer(): Promise<Viewer> {
  const session = await auth();
  const u = session?.user;
  return {
    id: u?.id ?? null,
    email: u?.email ?? null,
    role: (u?.role as AppRole | undefined) ?? "CLIENTE",
    isAdmin: Boolean(u?.isAdmin),
  };
}

// ───────────── Predicados de permissão ─────────────

/** Logado (qualquer papel). */
export function isLogged(v: Viewer): boolean {
  return Boolean(v.id);
}

/** Pode moderar conteúdo da comunidade (avaliações, cupons, dicas). */
export function canModerate(v: Viewer): boolean {
  return v.isAdmin || v.role === "MODERADOR";
}

/** É uma loja cadastrada (gerencia anúncios e responde avaliações). Admin também. */
export function isLoja(v: Viewer): boolean {
  return v.isAdmin || v.role === "LOJA";
}

/** Pode publicar cupom da comunidade (qualquer logado; entra para moderação). */
export function canSubmitCoupon(v: Viewer): boolean {
  return isLogged(v);
}

/**
 * Garante acesso à área de moderação (/moderar e ações de moderação): admin OU
 * MODERADOR. Redireciona para login se deslogado; 404 se sem permissão.
 */
export async function requireModerator(): Promise<Viewer> {
  const v = await getViewer();
  if (!v.id) redirect("/entrar");
  if (!canModerate(v)) notFound();
  return v;
}
