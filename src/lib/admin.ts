import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { adminEmails, isAdminEmail } from "@/lib/admin-emails";

export { adminEmails, isAdminEmail };

/** Garante que quem acessa /admin é admin. Loga-se se preciso; 404 se não-admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  if (!isAdminEmail(session.user.email)) notFound();
  return session;
}
