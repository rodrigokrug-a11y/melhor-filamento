import Link from "next/link";
import { ShieldCheck, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/db";
import { ROLE_LABEL, type AppRole } from "@/lib/permissions";

import { setUserRole } from "./actions";

const ROLES: AppRole[] = ["CLIENTE", "LOJA", "MODERADOR"];

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      ownedSeller: { select: { name: true, slug: true } },
    },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">Usuários</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Defina o papel de cada pessoa. Novo cadastro entra como{" "}
        <strong>Cliente</strong>; promova para <strong>Loja</strong> (gerencia
        anúncios) ou <strong>Moderador</strong> (modera a comunidade). O{" "}
        <strong>Admin</strong> é fixo pelo e-mail e não é editável aqui.
      </p>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum usuário ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Usuário</th>
                <th className="px-3 py-2 font-medium">Loja</th>
                <th className="px-3 py-2 font-medium">Papel</th>
                <th className="px-3 py-2 font-medium">Definir papel</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const admin = isAdminEmail(u.email);
                return (
                  <tr key={u.id} className="align-middle">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-foreground">
                        {u.name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {u.ownedSeller ? (
                        <Link
                          href={`/marca/${u.ownedSeller.slug}`}
                          className="inline-flex items-center gap-1 text-brand hover:underline"
                        >
                          <Store className="size-3.5" />
                          {u.ownedSeller.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {admin ? (
                        <Badge className="gap-1">
                          <ShieldCheck className="size-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {ROLE_LABEL[u.role as AppRole]}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {admin ? (
                        <span className="text-xs text-muted-foreground">
                          travado no e-mail
                        </span>
                      ) : (
                        <form action={setUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="h-9 rounded-lg border bg-background px-2 text-sm"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline">
                            Salvar
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
