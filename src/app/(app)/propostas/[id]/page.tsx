import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { publishProposal } from "@/app/(app)/propostas/actions";

export default async function ProposalAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const proposal = await prisma.proposal.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      client: true,
      diagnostic: true,
      events: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!proposal) notFound();

  const publicUrl = `/p/${proposal.slug}`;
  const sectionViews = proposal.events.filter((event) => event.type === "section_viewed");
  const hottest = sectionViews[0]?.section ?? "Ainda sem leitura";

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lilac">
            Proposta #{String(proposal.number).padStart(3, "0")}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{proposal.client.companyName}</h1>
          <p className="mt-2 text-muted">{proposal.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={proposal.status} />
          <Link
            href={`/propostas/${proposal.id}/editar`}
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm hover:border-lilac/40"
          >
            Editar proposta
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Mensalidade</p>
          <p className="mt-2 font-display text-2xl">{formatCurrency(proposal.monthlyValue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Score digital</p>
          <p className="mt-2 font-display text-2xl">{proposal.diagnostic?.overallScore ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Seção mais vista</p>
          <p className="mt-2 font-display text-2xl capitalize">{hottest}</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Link público</p>
          {proposal.status === "RASCUNHO" ? (
            <p className="mt-1 text-sm text-muted">
              Esta proposta ainda é rascunho. Publique para liberar o link do cliente.
            </p>
          ) : (
            <p className="mt-1 text-sm text-lilac">{publicUrl}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {proposal.status === "RASCUNHO" ? (
            <form action={publishProposal.bind(null, proposal.id)}>
              <Button type="submit">Publicar</Button>
            </form>
          ) : (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
            >
              Abrir proposta
            </Link>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl">Comportamento do cliente</h2>
        <ul className="mt-5 space-y-3 text-sm">
          {proposal.events.length === 0 ? (
            <li className="text-muted">Ainda sem eventos. O link ainda não foi aberto.</li>
          ) : (
            proposal.events.map((event) => (
              <li key={event.id} className="flex justify-between border-b border-line py-2">
                <span>{event.type.replaceAll("_", " ")}</span>
                <span className="text-muted">
                  {event.section ?? ""} · {event.createdAt.toLocaleString("pt-BR")}
                </span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
