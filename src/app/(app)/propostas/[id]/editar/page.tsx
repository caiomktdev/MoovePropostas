import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProposalBuilder } from "@/components/admin/proposal-builder";
import { proposalToDraft } from "@/lib/proposal-draft";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [proposal, clients, services, packages, settings] = await Promise.all([
    prisma.proposal.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        sections: true,
        services: true,
        problems: { orderBy: { sortOrder: "asc" } },
        opportunities: { orderBy: { sortOrder: "asc" } },
        diagnostic: {
          include: {
            instagramAnalysis: true,
            googleAnalysis: true,
            websiteAnalysis: true,
          },
        },
      },
    }),
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

  if (!proposal) notFound();

  return (
    <ProposalBuilder
      clients={clients}
      services={services}
      packages={packages}
      lockClient
      initialDraft={proposalToDraft(proposal, settings?.noWebsiteCopy)}
    />
  );
}
