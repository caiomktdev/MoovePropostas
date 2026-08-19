"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { publicToken, slugify } from "@/lib/utils";
import { reaisToCents, SECTION_BLUEPRINT } from "@/lib/proposal-draft";

const priority = z.enum(["CRITICA", "ALTA", "MEDIA", "BAIXA"]);

const draftSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, "Selecione um cliente."),
  title: z.string().min(3, "Informe o título da proposta."),
  coverHeadline: z.string().min(3),
  coverSubheadline: z.string(),
  contextBody: z.string(),
  roiBody: z.string(),
  packageId: z.string(),
  monthlyReais: z.number().min(0),
  setupReais: z.number().min(0),
  durationMonths: z.number().int().min(1).max(36),
  publish: z.boolean(),
  diagnostic: z.object({
    instagramScore: z.number().int().min(0).max(100),
    googleScore: z.number().int().min(0).max(100),
    websiteScore: z.number().int().min(0).max(100),
    contentScore: z.number().int().min(0).max(100),
    positioningScore: z.number().int().min(0).max(100),
    conversionScore: z.number().int().min(0).max(100),
    overallScore: z.number().int().min(0).max(100),
    interpretation: z.string(),
    hasWebsite: z.boolean(),
    noWebsiteCopy: z.string(),
    instagramFollowers: z.number().nullable(),
    engagementRate: z.number().nullable(),
    postingFrequency: z.string(),
    googleReviews: z.number().nullable(),
    googleRating: z.number().nullable(),
    websiteUrl: z.string(),
  }),
  problems: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      impact: z.string(),
      evidence: z.string(),
      priority,
    }),
  ),
  opportunities: z.array(
    z.object({
      category: z.string(),
      title: z.string(),
      description: z.string(),
      impact: z.string(),
      complexity: z.string(),
      priority,
    }),
  ),
  serviceIds: z.array(z.string()),
});

export async function saveProposal(input: unknown) {
  const user = await requireUser();
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos da proposta." };
  }

  const data = parsed.data;
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, organizationId: user.organizationId },
  });
  if (!client) return { error: "Cliente não encontrado." };

  const problems = data.problems.filter((item) => item.title.trim());
  const opportunities = data.opportunities.filter((item) => item.title.trim());
  if (!problems.length) return { error: "Inclua pelo menos um problema encontrado." };
  if (!opportunities.length) return { error: "Inclua pelo menos uma oportunidade." };
  if (!data.serviceIds.length) return { error: "Selecione ao menos um serviço." };

  const services = await prisma.service.findMany({
    where: { organizationId: user.organizationId, id: { in: data.serviceIds } },
  });
  const selectedPackage = data.packageId
    ? await prisma.package.findFirst({
        where: { id: data.packageId, organizationId: user.organizationId },
      })
    : null;

  const monthlyValue = reaisToCents(data.monthlyReais);
  const setupValue = reaisToCents(data.setupReais);
  const token = publicToken();
  const slug = `${slugify(client.companyName) || "proposta"}-${token}`;

  const owned = data.id
    ? await prisma.proposal.findFirst({
        where: { id: data.id, organizationId: user.organizationId },
        select: { id: true, status: true },
      })
    : null;
  if (data.id && !owned) return { error: "Proposta não encontrada." };

  const nextStatus = data.publish
    ? "ENVIADA"
    : owned && !["RASCUNHO", "REVISAO"].includes(owned.status)
      ? owned.status
      : "RASCUNHO";

  const proposalId = await prisma.$transaction(async (tx) => {
    const proposal = data.id
      ? await tx.proposal.update({
          where: { id: data.id },
          data: {
            title: data.title,
            coverHeadline: data.coverHeadline,
            coverSubheadline: data.coverSubheadline || null,
            packageId: selectedPackage?.id ?? null,
            monthlyValue,
            setupValue,
            durationMonths: data.durationMonths,
            status: nextStatus,
            ...(data.publish ? { publishedAt: new Date() } : {}),
          },
        })
      : await tx.proposal.create({
          data: {
            organizationId: user.organizationId,
            clientId: client.id,
            ownerId: user.id,
            title: data.title,
            slug,
            publicToken: slug,
            coverHeadline: data.coverHeadline,
            coverSubheadline: data.coverSubheadline || null,
            packageId: selectedPackage?.id ?? null,
            monthlyValue,
            setupValue,
            durationMonths: data.durationMonths,
            status: nextStatus,
            publishedAt: data.publish ? new Date() : null,
          },
        });

    await tx.proposalService.deleteMany({ where: { proposalId: proposal.id } });
    await tx.problem.deleteMany({ where: { proposalId: proposal.id } });
    await tx.opportunity.deleteMany({ where: { proposalId: proposal.id } });
    await tx.proposalSection.deleteMany({ where: { proposalId: proposal.id } });
    await tx.instagramAnalysis.deleteMany({
      where: { diagnostic: { proposalId: proposal.id } },
    });
    await tx.googleAnalysis.deleteMany({
      where: { diagnostic: { proposalId: proposal.id } },
    });
    await tx.websiteAnalysis.deleteMany({
      where: { diagnostic: { proposalId: proposal.id } },
    });
    await tx.diagnostic.deleteMany({ where: { proposalId: proposal.id } });

    const diagnostic = await tx.diagnostic.create({
      data: {
        proposalId: proposal.id,
        instagramScore: data.diagnostic.instagramScore,
        googleScore: data.diagnostic.googleScore,
        websiteScore: data.diagnostic.websiteScore,
        contentScore: data.diagnostic.contentScore,
        positioningScore: data.diagnostic.positioningScore,
        conversionScore: data.diagnostic.conversionScore,
        overallScore: data.diagnostic.overallScore,
        interpretation: data.diagnostic.interpretation || null,
        hasWebsite: data.diagnostic.hasWebsite,
        noWebsiteCopy: data.diagnostic.hasWebsite ? null : data.diagnostic.noWebsiteCopy,
      },
    });

    await tx.instagramAnalysis.create({
      data: {
        diagnosticId: diagnostic.id,
        followers: data.diagnostic.instagramFollowers,
        engagementRate: data.diagnostic.engagementRate,
        postingFrequency: data.diagnostic.postingFrequency || null,
      },
    });
    await tx.googleAnalysis.create({
      data: {
        diagnosticId: diagnostic.id,
        reviewCount: data.diagnostic.googleReviews,
        rating: data.diagnostic.googleRating,
        hasBusinessProfile: (data.diagnostic.googleReviews ?? 0) > 0,
      },
    });
    if (data.diagnostic.hasWebsite) {
      await tx.websiteAnalysis.create({
        data: {
          diagnosticId: diagnostic.id,
          url: data.diagnostic.websiteUrl || null,
        },
      });
    }

    await tx.problem.createMany({
      data: problems.map((item, index) => ({
        proposalId: proposal.id,
        title: item.title.trim(),
        description: item.description.trim(),
        impact: item.impact.trim(),
        evidence: item.evidence.trim(),
        priority: item.priority,
        sortOrder: index + 1,
      })),
    });

    await tx.opportunity.createMany({
      data: opportunities.map((item, index) => ({
        proposalId: proposal.id,
        category: item.category,
        title: item.title.trim(),
        description: item.description.trim(),
        impact: item.impact.trim(),
        complexity: item.complexity.trim(),
        priority: item.priority,
        sortOrder: index + 1,
      })),
    });

    await tx.proposalService.createMany({
      data: services.map((service) => ({
        proposalId: proposal.id,
        serviceId: service.id,
        price: service.defaultPrice,
        quantity: 1,
      })),
    });

    await tx.proposalSection.createMany({
      data: SECTION_BLUEPRINT.map((section) => ({
        proposalId: proposal.id,
        type: section.type,
        title: section.title,
        subtitle: "subtitle" in section ? section.subtitle : null,
        body:
          section.type === "context"
            ? data.contextBody
            : section.type === "roi"
              ? data.roiBody
              : null,
        sortOrder: section.sortOrder,
      })),
    });

    return proposal.id;
  });

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath(`/clientes/${client.id}`);
  redirect(`/propostas/${proposalId}`);
}

export async function publishProposal(proposalId: string) {
  const user = await requireUser();
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, organizationId: user.organizationId },
    include: { _count: { select: { problems: true, opportunities: true, services: true } } },
  });
  if (!proposal) return { error: "Proposta não encontrada." };
  if (!proposal._count.problems || !proposal._count.opportunities || !proposal._count.services) {
    return { error: "Complete a montagem da proposta antes de publicar." };
  }

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "ENVIADA", publishedAt: proposal.publishedAt ?? new Date() },
  });

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposal.id}`);
  redirect(`/propostas/${proposal.id}`);
}
