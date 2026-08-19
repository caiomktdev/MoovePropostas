import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const getPublicProposal = cache(async (slug: string) => {
  const proposal = await prisma.proposal.findFirst({
    where: {
      slug,
      status: { notIn: ["RASCUNHO"] },
    },
    include: {
      client: true,
      owner: true,
      organization: true,
      package: true,
      diagnostic: {
        include: {
          instagramAnalysis: true,
          googleAnalysis: true,
          websiteAnalysis: true,
        },
      },
      problems: { orderBy: { sortOrder: "asc" } },
      opportunities: { orderBy: { sortOrder: "asc" } },
      services: { include: { service: true } },
      sections: { where: { visible: true }, orderBy: { sortOrder: "asc" } },
      acceptance: true,
    },
  });

  if (!proposal) notFound();
  return proposal;
});

export function toPlain<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, inner) => {
      if (inner && typeof inner === "object" && typeof inner.toNumber === "function") {
        return inner.toNumber();
      }
      return inner;
    }),
  ) as T;
}

export type PublicProposal = Awaited<ReturnType<typeof getPublicProposal>>;
