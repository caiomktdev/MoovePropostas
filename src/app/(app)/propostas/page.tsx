import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default async function ProposalsPage() {
  const user = await requireUser();
  const proposals = await prisma.proposal.findMany({
    where: { organizationId: user.organizationId },
    include: { client: true, owner: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lilac">Biblioteca</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Propostas</h1>
        </div>
        <Link
          href="/propostas/nova"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          Nova proposta
        </Link>
      </header>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/3 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="border-t border-line">
                <td className="px-4 py-4">
                  <Link href={`/propostas/${proposal.id}`} className="hover:text-lilac">
                    {proposal.client.companyName}
                  </Link>
                </td>
                <td className="px-4 py-4 text-muted">{proposal.title}</td>
                <td className="px-4 py-4">{formatCurrency(proposal.monthlyValue)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={proposal.status} />
                </td>
                <td className="px-4 py-4 text-muted">{proposal.owner.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
