"use client";

import { useActionState } from "react";
import { acceptProposal } from "@/app/p/[slug]/actions";
import { Button } from "@/components/ui/button";

export function AcceptanceForm({
  slug,
  alreadyAccepted,
}: {
  slug: string;
  alreadyAccepted: boolean;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; ok?: boolean } | undefined, formData: FormData) =>
      acceptProposal(formData),
    undefined,
  );

  if (alreadyAccepted || state?.ok) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-ok/30 bg-ok/10 px-6 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-ok">Confirmado</p>
        <h3 className="mt-3 font-display text-3xl">Proposta aceita</h3>
        <p className="mt-2 text-sm text-muted">
          Registramos o aceite com data, horário e responsável. A Moove entra em contato para o próximo passo.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={slug} />
      <Field name="name" label="Nome" required />
      <Field name="role" label="Cargo" required />
      <Field name="email" label="E-mail" type="email" required />
      <Field name="phone" label="Telefone" />
      <label className="flex items-start gap-3 text-sm text-muted">
        <input name="agreed" type="checkbox" required className="mt-1 accent-primary" />
        Li a proposta e concordo com o escopo e o investimento apresentados.
      </label>
      {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Registrando…" : "Aceitar proposta"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 w-full rounded-2xl border border-line bg-white/4 px-4 outline-none focus:border-lilac/50"
      />
    </label>
  );
}
