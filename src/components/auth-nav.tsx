"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    const isAdmin = session?.user?.isAdmin ?? false;
    return (
      <div className="flex items-center gap-1">
        <Link
          href={isAdmin ? "/admin" : "/painel"}
          className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {isAdmin ? "Admin" : "Painel"}
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
    <Link
      href="/entrar"
      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      Entrar
    </Link>
  );
}
