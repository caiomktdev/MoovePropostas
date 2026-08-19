"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="w-full max-w-md space-y-5">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue="comercial@moove.com.br"
          className="h-12 w-full rounded-2xl border border-line bg-white/4 px-4 text-ink outline-none transition focus:border-lilac/50"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          defaultValue="moove2026"
          className="h-12 w-full rounded-2xl border border-line bg-white/4 px-4 text-ink outline-none transition focus:border-lilac/50"
        />
      </label>
      {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
