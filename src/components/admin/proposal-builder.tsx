"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { type Priority, type Recurrence } from "@prisma/client";
import { saveProposal } from "@/app/(app)/propostas/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  OPPORTUNITY_CATEGORIES,
  averageScore,
  centsToReais,
  emptyOpportunity,
  emptyProblem,
  type ProposalDraft,
} from "@/lib/proposal-draft";
import { formatCurrency } from "@/lib/utils";

const STEPS = [
  { id: "capa", label: "Cliente e capa" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "problemas", label: "Problemas" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "plano", label: "Plano e investimento" },
  { id: "revisao", label: "Revisão" },
] as const;

const PRIORITIES: Priority[] = ["CRITICA", "ALTA", "MEDIA", "BAIXA"];

const SCORE_FIELDS = [
  ["instagramScore", "Instagram"],
  ["googleScore", "Google"],
  ["websiteScore", "Website"],
  ["contentScore", "Conteúdo"],
  ["positioningScore", "Posicionamento"],
  ["conversionScore", "Conversão"],
] as const;

type ClientOption = {
  id: string;
  companyName: string;
  website: string | null;
  instagram: string | null;
};

type ServiceOption = {
  id: string;
  name: string;
  tagline: string;
  defaultPrice: number;
  recurrence: Recurrence;
};

type PackageOption = {
  id: string;
  name: string;
  monthlyPrice: number;
  setupPrice: number;
  description: string;
  recommended: boolean;
};

const fieldClass =
  "h-12 w-full rounded-2xl border border-line bg-white/4 px-4 outline-none focus:border-lilac/50";
const areaClass =
  "w-full rounded-2xl border border-line bg-white/4 px-4 py-3 outline-none focus:border-lilac/50";

export function ProposalBuilder({
  initialDraft,
  clients,
  services,
  packages,
  lockClient,
}: {
  initialDraft: ProposalDraft;
  clients: ClientOption[];
  services: ServiceOption[];
  packages: PackageOption[];
  lockClient?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const client = clients.find((item) => item.id === draft.clientId);
  const selectedPackage = packages.find((item) => item.id === draft.packageId);
  const selectedServices = services.filter((item) => draft.serviceIds.includes(item.id));

  const overall = useMemo(
    () =>
      averageScore([
        draft.diagnostic.instagramScore,
        draft.diagnostic.googleScore,
        draft.diagnostic.websiteScore,
        draft.diagnostic.contentScore,
        draft.diagnostic.positioningScore,
        draft.diagnostic.conversionScore,
      ]),
    [draft.diagnostic],
  );

  function update<K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectClient(clientId: string) {
    const next = clients.find((item) => item.id === clientId);
    setDraft((current) => ({
      ...current,
      clientId,
      title:
        !current.title || current.title.startsWith("Proposta comercial")
          ? next
            ? `Proposta comercial · ${next.companyName}`
            : current.title
          : current.title,
      coverSubheadline:
        current.coverSubheadline || (next ? `Uma leitura estratégica para ${next.companyName}.` : ""),
      diagnostic: {
        ...current.diagnostic,
        hasWebsite: Boolean(next?.website),
        websiteUrl: next?.website || current.diagnostic.websiteUrl,
      },
    }));
  }

  function submit(publish: boolean) {
    setError(null);
    const payload: ProposalDraft = {
      ...draft,
      publish,
      title: draft.title.trim() || (client ? `Proposta comercial · ${client.companyName}` : draft.title),
      diagnostic: { ...draft.diagnostic, overallScore: overall },
    };
    startTransition(async () => {
      const result = await saveProposal(payload);
      if (result?.error) setError(result.error);
    });
  }

  if (!clients.length) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-lilac">Antes de montar</p>
        <h1 className="mt-2 font-display text-3xl">Cadastre um cliente</h1>
        <p className="mt-3 text-sm text-muted">
          A proposta é montada para um cliente já existente. Crie a empresa primeiro e volte aqui.
        </p>
        <Link
          href="/clientes/novo"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          Novo cliente
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-lilac">
          {draft.id ? "Editar proposta" : "Montar proposta"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {client?.companyName ?? "Nova proposta comercial"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Cliente separado da proposta. Aqui você monta diagnóstico, plano e investimento.
        </p>
      </header>

      <ol className="grid gap-2 sm:grid-cols-6">
        {STEPS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                index === step
                  ? "border-lilac/50 bg-white/8"
                  : "border-line bg-white/3 text-muted hover:border-line-strong"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-[0.18em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-sm">{item.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card className="space-y-4 p-6">
          <Field label="Cliente">
            <select
              className={fieldClass}
              value={draft.clientId}
              disabled={lockClient}
              onChange={(event) => selectClient(event.target.value)}
            >
              <option value="">Selecione</option>
              {clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.companyName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Título interno">
            <input className={fieldClass} value={draft.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field label="Headline da capa">
            <input
              className={fieldClass}
              value={draft.coverHeadline}
              onChange={(e) => update("coverHeadline", e.target.value)}
            />
          </Field>
          <Field label="Subheadline">
            <input
              className={fieldClass}
              value={draft.coverSubheadline}
              onChange={(e) => update("coverSubheadline", e.target.value)}
            />
          </Field>
          <Field label="Contexto — o momento do cliente">
            <textarea
              rows={5}
              className={areaClass}
              value={draft.contextBody}
              onChange={(e) => update("contextBody", e.target.value)}
              placeholder="O que vocês entenderam do negócio, do mercado e do momento comercial."
            />
          </Field>
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {SCORE_FIELDS.map(([key, label]) => (
              <Field key={key} label={`${label} (0–100)`}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={fieldClass}
                  value={draft.diagnostic[key]}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      diagnostic: { ...current.diagnostic, [key]: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </Field>
            ))}
          </div>
          <p className="text-sm text-muted">
            Score geral calculado: <span className="text-lilac">{overall}</span>
          </p>
          <Field label="Interpretação do diagnóstico">
            <textarea
              rows={4}
              className={areaClass}
              value={draft.diagnostic.interpretation}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  diagnostic: { ...current.diagnostic, interpretation: e.target.value },
                }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Seguidores no Instagram">
              <input
                type="number"
                className={fieldClass}
                value={draft.diagnostic.instagramFollowers ?? ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, instagramFollowers: optionalNumber(e.target.value) },
                  }))
                }
              />
            </Field>
            <Field label="Engajamento (%)">
              <input
                type="number"
                step="0.1"
                className={fieldClass}
                value={draft.diagnostic.engagementRate ?? ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, engagementRate: optionalNumber(e.target.value) },
                  }))
                }
              />
            </Field>
            <Field label="Frequência de posts">
              <input
                className={fieldClass}
                value={draft.diagnostic.postingFrequency}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, postingFrequency: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Avaliações no Google">
              <input
                type="number"
                className={fieldClass}
                value={draft.diagnostic.googleReviews ?? ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, googleReviews: optionalNumber(e.target.value) },
                  }))
                }
              />
            </Field>
            <Field label="Nota Google">
              <input
                type="number"
                step="0.1"
                className={fieldClass}
                value={draft.diagnostic.googleRating ?? ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, googleRating: optionalNumber(e.target.value) },
                  }))
                }
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.diagnostic.hasWebsite}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  diagnostic: { ...current.diagnostic, hasWebsite: e.target.checked },
                }))
              }
            />
            O cliente já tem website
          </label>
          {draft.diagnostic.hasWebsite ? (
            <Field label="URL do site">
              <input
                className={fieldClass}
                value={draft.diagnostic.websiteUrl}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, websiteUrl: e.target.value },
                  }))
                }
              />
            </Field>
          ) : (
            <Field label="Texto para ausência de site">
              <textarea
                rows={3}
                className={areaClass}
                value={draft.diagnostic.noWebsiteCopy}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    diagnostic: { ...current.diagnostic, noWebsiteCopy: e.target.value },
                  }))
                }
              />
            </Field>
          )}
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {draft.problems.map((problem, index) => (
            <Card key={index} className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Problema {index + 1}</p>
                {draft.problems.length > 1 && (
                  <button type="button" onClick={() => update("problems", draft.problems.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4 text-muted" />
                  </button>
                )}
              </div>
              <input
                className={fieldClass}
                placeholder="Título"
                value={problem.title}
                onChange={(e) => update("problems", patchAt(draft.problems, index, { title: e.target.value }))}
              />
              <textarea
                rows={3}
                className={areaClass}
                placeholder="Descrição"
                value={problem.description}
                onChange={(e) => update("problems", patchAt(draft.problems, index, { description: e.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className={fieldClass}
                  placeholder="Impacto comercial"
                  value={problem.impact}
                  onChange={(e) => update("problems", patchAt(draft.problems, index, { impact: e.target.value }))}
                />
                <input
                  className={fieldClass}
                  placeholder="Evidência"
                  value={problem.evidence}
                  onChange={(e) => update("problems", patchAt(draft.problems, index, { evidence: e.target.value }))}
                />
              </div>
              <select
                className={fieldClass}
                value={problem.priority}
                onChange={(e) =>
                  update("problems", patchAt(draft.problems, index, { priority: e.target.value as Priority }))
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Card>
          ))}
          <Button variant="line" onClick={() => update("problems", [...draft.problems, emptyProblem()])}>
            <Plus className="h-4 w-4" />
            Adicionar problema
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {draft.opportunities.map((item, index) => (
            <Card key={index} className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Oportunidade {index + 1}</p>
                {draft.opportunities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update("opportunities", draft.opportunities.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-muted" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  className={fieldClass}
                  value={item.category}
                  onChange={(e) =>
                    update("opportunities", patchAt(draft.opportunities, index, { category: e.target.value }))
                  }
                >
                  {OPPORTUNITY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  className={fieldClass}
                  value={item.priority}
                  onChange={(e) =>
                    update("opportunities", patchAt(draft.opportunities, index, { priority: e.target.value as Priority }))
                  }
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className={fieldClass}
                placeholder="Título"
                value={item.title}
                onChange={(e) => update("opportunities", patchAt(draft.opportunities, index, { title: e.target.value }))}
              />
              <textarea
                rows={3}
                className={areaClass}
                placeholder="Descrição"
                value={item.description}
                onChange={(e) =>
                  update("opportunities", patchAt(draft.opportunities, index, { description: e.target.value }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className={fieldClass}
                  placeholder="Impacto"
                  value={item.impact}
                  onChange={(e) =>
                    update("opportunities", patchAt(draft.opportunities, index, { impact: e.target.value }))
                  }
                />
                <input
                  className={fieldClass}
                  placeholder="Complexidade"
                  value={item.complexity}
                  onChange={(e) =>
                    update("opportunities", patchAt(draft.opportunities, index, { complexity: e.target.value }))
                  }
                />
              </div>
            </Card>
          ))}
          <Button variant="line" onClick={() => update("opportunities", [...draft.opportunities, emptyOpportunity()])}>
            <Plus className="h-4 w-4" />
            Adicionar oportunidade
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <Card className="space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Pacote sugerido</p>
            <div className="grid gap-3 md:grid-cols-3">
              {packages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      packageId: item.id,
                      monthlyReais: centsToReais(item.monthlyPrice),
                      setupReais: centsToReais(item.setupPrice),
                    }))
                  }
                  className={`rounded-2xl border p-4 text-left ${
                    draft.packageId === item.id ? "border-lilac/50 bg-white/8" : "border-line hover:border-line-strong"
                  }`}
                >
                  <p className="font-display text-xl">{item.name}</p>
                  <p className="mt-1 text-sm text-lilac">{formatCurrency(item.monthlyPrice)} / mês</p>
                  <p className="mt-2 text-xs text-muted">{item.description}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Serviços incluídos</p>
            <div className="grid gap-3">
              {services.map((service) => {
                const checked = draft.serviceIds.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                      checked ? "border-lilac/40 bg-white/6" : "border-line"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() =>
                        update(
                          "serviceIds",
                          checked
                            ? draft.serviceIds.filter((id) => id !== service.id)
                            : [...draft.serviceIds, service.id],
                        )
                      }
                    />
                    <span>
                      <span className="block text-sm">{service.name}</span>
                      <span className="mt-1 block text-xs text-muted">{service.tagline}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>
          <Card className="grid gap-4 p-6 sm:grid-cols-3">
            <Field label="Mensalidade (R$)">
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={draft.monthlyReais}
                onChange={(e) => update("monthlyReais", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Setup (R$)">
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={draft.setupReais}
                onChange={(e) => update("setupReais", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Duração (meses)">
              <input
                type="number"
                min={1}
                max={36}
                className={fieldClass}
                value={draft.durationMonths}
                onChange={(e) => update("durationMonths", Number(e.target.value) || 12)}
              />
            </Field>
            <div className="sm:col-span-3">
              <Field label="O que pode ser construído (ROI)">
                <textarea
                  rows={4}
                  className={areaClass}
                  value={draft.roiBody}
                  onChange={(e) => update("roiBody", e.target.value)}
                />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {step === 5 && (
        <Card className="space-y-5 p-6">
          <Row label="Cliente" value={client?.companyName ?? "Não selecionado"} />
          <Row label="Título" value={draft.title || "—"} />
          <Row label="Score geral" value={String(overall)} />
          <Row label="Problemas" value={String(draft.problems.filter((item) => item.title.trim()).length)} />
          <Row label="Oportunidades" value={String(draft.opportunities.filter((item) => item.title.trim()).length)} />
          <Row label="Pacote" value={selectedPackage?.name ?? "Personalizado"} />
          <Row
            label="Serviços"
            value={selectedServices.map((item) => item.name).join(", ") || "Nenhum"}
          />
          <Row label="Mensalidade" value={formatCurrency(draft.monthlyReais * 100)} />
          <Row label="Setup" value={formatCurrency(draft.setupReais * 100)} />
          <p className="text-sm text-muted">
            Salvar rascunho guarda a montagem. Publicar libera o link público para o cliente.
          </p>
        </Card>
      )}

      {error && <p className="text-sm text-crit">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
          Voltar
        </Button>
        <div className="flex flex-wrap gap-3">
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((current) => current + 1)}>Continuar</Button>
          ) : (
            <>
              <Button variant="line" disabled={pending} onClick={() => submit(false)}>
                Salvar rascunho
              </Button>
              <Button disabled={pending} onClick={() => submit(true)}>
                {pending ? "Publicando…" : "Publicar proposta"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function patchAt<T>(list: T[], index: number, patch: Partial<T>) {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function optionalNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
