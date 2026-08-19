import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProposalBuilder } from "@/components/admin/proposal-builder";
import { emptyProposalDraft } from "@/lib/proposal-draft";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const user = await requireUser();
  const { cliente: clientId } = await searchParams;

  const [clients, services, packages, settings] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true, website: true, instagram: true },
    }),
    prisma.service.findMany({
      where: { organizationId: user.organizationId, active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, tagline: true, defaultPrice: true, recurrence: true },
    }),
    prisma.package.findMany({
      where: { organizationId: user.organizationId, active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        monthlyPrice: true,
        setupPrice: true,
        description: true,
        recommended: true,
      },
    }),
    prisma.organizationSettings.findUnique({
      where: { organizationId: user.organizationId },
    }),
  ]);

  const selected = clients.find((item) => item.id === clientId);

  return (
    <ProposalBuilder
      clients={clients}
      services={services}
      packages={packages}
      lockClient={Boolean(selected)}
      initialDraft={emptyProposalDraft({
        clientId: selected?.id,
        companyName: selected?.companyName,
        website: selected?.website,
        noWebsiteCopy: settings?.noWebsiteCopy,
      })}
    />
  );
}
