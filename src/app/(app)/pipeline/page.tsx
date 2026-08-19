import Link from "next/link";
import { ProposalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

const COLUMNS: ProposalStatus[] = [
  "RASCUNHO",
  "REVISAO",
  "ENVIADA",
  "VISUALIZADA",
  "EM_NEGOCIACAO",
  "APROVADA",
  "PERDIDA",
];

const TITLES: Record<ProposalStatus, string> = {
  RASCUNHO: "Rascunho",
  REVISAO: "Revisão",
  ENVIADA: "Enviada",
  VISUALIZADA: "Visualizada",
  EM_NEGOCIACAO: "Negociação",
  APROVADA: "Aprovada",
  PERDIDA: "Perdida",
};

export default async function PipelinePage() {
  const user = await requireUser();
  const proposals = await prisma.proposal.findMany({
    where: { organizationId: user.organizationId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-24">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-lilac">CRM</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Pipeline</h1>
        <p className="mt-2 text-sm text-muted">Do rascunho ao aceite — um quadro, um olhar.</p>
      </header>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const items = proposals.filter((proposal) => proposal.status === status);
          return (
            <section
              key={status}
              className="w-72 shrink-0 rounded-[var(--radius-lg)] border border-line bg-surface/70 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-xs uppercase tracking-[0.18em] text-muted">{TITLES[status]}</h2>
                <span className="text-xs text-faint">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/propostas/${proposal.id}`}
                    className="block rounded-2xl border border-line bg-white/3 p-4 transition hover:border-lilac/30"
                  >
                    <p className="text-sm">{proposal.client.companyName}</p>
                    <p className="mt-1 text-xs text-muted">{proposal.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-lilac">{formatCurrency(proposal.monthlyValue)}</span>
                      <StatusBadge status={proposal.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
