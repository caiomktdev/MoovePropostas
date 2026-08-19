import Link from "next/link";
import { ProposalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DashboardChart } from "@/components/admin/dashboard-chart";

export default async function DashboardPage() {
  const user = await requireUser();
  const orgId = user.organizationId;

  const [proposals, clients] = await Promise.all([
    prisma.proposal.findMany({
      where: { organizationId: orgId },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const count = (status: ProposalStatus) => proposals.filter((item) => item.status === status).length;
  const sent = proposals.filter((item) => item.status !== "RASCUNHO" && item.status !== "REVISAO");
  const opened = proposals.filter((item) =>
    ["VISUALIZADA", "EM_NEGOCIACAO", "APROVADA"].includes(item.status),
  );
  const approved = count("APROVADA");
  const pipelineValue = proposals
    .filter((item) => !["PERDIDA", "RASCUNHO"].includes(item.status))
    .reduce((sum, item) => sum + item.monthlyValue, 0);
  const negotiationValue = proposals
    .filter((item) => ["ENVIADA", "VISUALIZADA", "EM_NEGOCIACAO"].includes(item.status))
    .reduce((sum, item) => sum + item.monthlyValue, 0);
  const openRate = sent.length ? Math.round((opened.length / sent.length) * 100) : 0;
  const conversion = sent.length ? Math.round((approved / sent.length) * 100) : 0;

  const kpis = [
    { label: "Valor em propostas", value: formatCurrency(pipelineValue) },
    { label: "Propostas enviadas", value: String(sent.length) },
    { label: "Taxa de abertura", value: `${openRate}%` },
    { label: "Conversão", value: `${conversion}%` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lilac">Moove Propostas</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Painel comercial</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            O que está em movimento agora — valor, ritmo e interesse.
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          Novo cliente
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="px-5 py-5 hover:shadow-[0_0_48px_-24px_rgb(94_43_255_/_0.7)]">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{kpi.label}</p>
            <p className="mt-3 font-display text-3xl tracking-tight">{kpi.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Evolução do pipeline</p>
          <h2 className="mt-2 font-display text-2xl">Valor mensal em aberto</h2>
          <div className="mt-6 h-56">
            <DashboardChart value={negotiationValue} />
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Em negociação</p>
          <p className="mt-2 font-display text-3xl">{formatCurrency(negotiationValue)}</p>
          <p className="mt-2 text-sm text-muted">
            Soma das propostas enviadas, visualizadas e em conversa.
          </p>
          <div className="mt-6 space-y-3">
            <Row label="Rascunho" value={count("RASCUNHO")} />
            <Row label="Enviadas" value={count("ENVIADA")} />
            <Row label="Visualizadas" value={count("VISUALIZADA")} />
            <Row label="Aprovadas" value={approved} />
            <Row label="Expiradas / perdidas" value={count("PERDIDA")} />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl">Propostas recentes</h2>
            <Link href="/propostas" className="text-xs uppercase tracking-[0.16em] text-lilac">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {proposals.slice(0, 5).map((proposal) => (
              <Link
                key={proposal.id}
                href={`/propostas/${proposal.id}`}
                className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition hover:border-line hover:bg-white/3"
              >
                <div>
                  <p className="text-sm">{proposal.client.companyName}</p>
                  <p className="text-xs text-muted">{proposal.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-lilac">{formatCurrency(proposal.monthlyValue)}</span>
                  <StatusBadge status={proposal.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl">Clientes recentes</h2>
          <div className="mt-5 space-y-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clientes/${client.id}`}
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-white/3"
              >
                <div>
                  <p className="text-sm">{client.companyName}</p>
                  <p className="text-xs text-muted">
                    {[client.city, client.state].filter(Boolean).join(" · ") || "Sem cidade"}
                  </p>
                </div>
                <span className="text-xs text-muted">{client.segment ?? "—"}</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
