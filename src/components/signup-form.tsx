"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

import { createBuyerAccount } from "@/app/criar-conta/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createBuyerAccount({ name, email, password });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });
      if (login?.error || !login?.ok) {
        setError("Conta criada! Agora é só entrar com seu e-mail e senha.");
        setLoading(false);
        return;
      }
      window.location.href = login.url ?? "/";
    } catch {
      setError("Não foi possível criar a conta agora.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como quer ser chamado"
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Pelo menos 6 caracteres"
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
