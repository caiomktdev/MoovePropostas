import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/card";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, organizationId: user.organizationId },
    include: { proposals: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-lilac">{client.segment}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{client.companyName}</h1>
        <p className="mt-2 text-muted">
          {client.contactName} · {client.contactRole} · {client.instagram}
        </p>
      </header>
      <Card className="grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Cidade" value={[client.city, client.state].filter(Boolean).join(" / ")} />
        <Field label="E-mail" value={client.email} />
        <Field label="WhatsApp" value={client.whatsapp} />
        <Field label="Site" value={client.website ?? "Não possui"} />
      </Card>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Propostas</h2>
        {client.proposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/propostas/${proposal.id}`}
            className="block rounded-2xl border border-line px-4 py-4 hover:border-lilac/30"
          >
            {proposal.title}
          </Link>
        ))}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 text-sm">{value || "—"}</p>
    </div>
  );
}
