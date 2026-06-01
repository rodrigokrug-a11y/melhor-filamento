// Checagem de admin por e-mail (env-only, sem dependência de auth/Prisma).
// Mantido separado de admin.ts para evitar import circular com auth.ts.

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
