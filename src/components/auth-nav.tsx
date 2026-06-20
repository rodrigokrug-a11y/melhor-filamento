"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    const isAdmin = session?.user?.isAdmin ?? false;
    const role = session?.user?.role;
    const dest = isAdmin
      ? { href: "/admin", label: "Admin" }
      : role === "MODERADOR"
        ? { href: "/moderar", label: "Moderar" }
        : { href: "/painel", label: "Painel" };
    return (
      <div className="flex items-center gap-1">
        <Link
          href={dest.href}
          className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {dest.label}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Sair"
          aria-label="Sair"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/entrar"
        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Entrar
      </Link>
      <Link
        href="/criar-conta"
        className="rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal"
      >
        Criar conta
      </Link>
    </div>
  );
}
