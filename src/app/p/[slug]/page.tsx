import type { Metadata } from "next";
import { getPublicProposal, toPlain } from "@/lib/proposals";
import { ProposalExperience } from "@/components/proposal/proposal-experience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proposal = await getPublicProposal(slug);
  return {
    title: `Proposta para ${proposal.client.companyName}`,
    description: proposal.coverHeadline,
    robots: { index: false, follow: false },
  };
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proposal = await getPublicProposal(slug);
  return <ProposalExperience proposal={toPlain(proposal)} />;
}
