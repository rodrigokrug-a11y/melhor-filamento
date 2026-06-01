"use client";

import { useState } from "react";
import { CircleCheck, Loader2, LogIn, Mail } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EntrarForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<null | "password" | "magic">(null);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading("password");
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/painel",
      });
      if (res?.error || !res?.ok) {
        setError("E-mail ou senha inválidos.");
      } else {
        window.location.href = res.url ?? "/painel";
        return;
      }
    } catch {
      setError("Não foi possível entrar.");
    } finally {
      setLoading(null);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      setError("Informe seu e-mail para receber o link.");
      return;
    }
    setLoading("magic");
    setError(null);
    try {
      const res = await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: "/painel",
      });
      if (res?.error) setError("Não foi possível enviar o link.");
      else setMagicSent(true);
    } catch {
      setError("Não foi possível enviar o link.");
    } finally {
      setLoading(null);
    }
  }

  if (magicSent) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <CircleCheck className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-3 font-semibold">Confira seu e-mail</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviamos um link de acesso para <strong>{email}</strong>. Em
          desenvolvimento, o link aparece no console do servidor.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={loginWithPassword}
      className="space-y-3 rounded-xl border bg-card p-6"
    >
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading !== null}>
        {loading === "password" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LogIn />
        )}
        Entrar
      </Button>

      <div className="text-center text-xs text-muted-foreground">ou</div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={sendMagicLink}
        disabled={loading !== null}
      >
        {loading === "magic" ? <Loader2 className="animate-spin" /> : <Mail />}
        Receber link por e-mail
      </Button>
    </form>
  );
}
