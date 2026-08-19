import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/card";

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await prisma.client.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lilac">Carteira</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Clientes</h1>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          Novo cliente
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <Link key={client.id} href={`/clientes/${client.id}`}>
            <Card className="h-full p-6 hover:border-lilac/30">
              <p className="font-display text-2xl">{client.companyName}</p>
              <p className="mt-1 text-sm text-muted">
                {client.segment ?? "Segmento a definir"} · {client.contactName ?? "Sem responsável"}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-faint">
                {client._count.proposals} proposta(s)
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
