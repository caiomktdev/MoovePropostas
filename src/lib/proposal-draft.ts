import { type Priority } from "@prisma/client";

export const SECTION_BLUEPRINT = [
  { type: "cover", title: "Capa", sortOrder: 1 },
  { type: "context", title: "Entendemos o seu momento.", sortOrder: 2 },
  { type: "diagnostic", title: "Encontramos estas oportunidades.", sortOrder: 3 },
  { type: "problems", title: "O que está impedindo seu crescimento.", sortOrder: 4 },
  { type: "opportunities", title: "Onde podemos gerar impacto.", sortOrder: 5 },
  { type: "strategy", title: "Como vamos resolver.", sortOrder: 6 },
  { type: "plan", title: "O que será executado.", sortOrder: 7 },
  { type: "investment", title: "Quanto custa essa transformação.", sortOrder: 8 },
  { type: "roi", title: "O que pode ser construído.", sortOrder: 9 },
  { type: "cta", title: "Vamos começar?", subtitle: "Pronto para o próximo nível?", sortOrder: 10 },
] as const;

export const OPPORTUNITY_CATEGORIES = [
  "conteúdo",
  "tráfego",
  "SEO",
  "site",
  "branding",
  "automação",
  "CRM",
  "inteligência artificial",
  "geração de leads",
  "remarketing",
] as const;

export type ProblemDraft = {
  title: string;
  description: string;
  impact: string;
  evidence: string;
  priority: Priority;
};

export type OpportunityDraft = {
  category: string;
  title: string;
  description: string;
  impact: string;
  complexity: string;
  priority: Priority;
};

export type ProposalDraft = {
  id?: string;
  clientId: string;
  title: string;
  coverHeadline: string;
  coverSubheadline: string;
  contextBody: string;
  roiBody: string;
  packageId: string;
  monthlyReais: number;
  setupReais: number;
  durationMonths: number;
  publish: boolean;
  diagnostic: {
    instagramScore: number;
    googleScore: number;
    websiteScore: number;
    contentScore: number;
    positioningScore: number;
    conversionScore: number;
    overallScore: number;
    interpretation: string;
    hasWebsite: boolean;
    noWebsiteCopy: string;
    instagramFollowers: number | null;
    engagementRate: number | null;
    postingFrequency: string;
    googleReviews: number | null;
    googleRating: number | null;
    websiteUrl: string;
  };
  problems: ProblemDraft[];
  opportunities: OpportunityDraft[];
  serviceIds: string[];
};

export function reaisToCents(reais: number) {
  if (!Number.isFinite(reais)) return 0;
  return Math.round(reais * 100);
}

export function centsToReais(cents: number) {
  return Math.round(cents / 100);
}

export function averageScore(values: number[]) {
  const filled = values.filter((value) => value > 0);
  if (!filled.length) return 0;
  return Math.round(filled.reduce((sum, value) => sum + value, 0) / filled.length);
}

export function emptyProblem(): ProblemDraft {
  return { title: "", description: "", impact: "", evidence: "", priority: "ALTA" };
}

export function emptyOpportunity(): OpportunityDraft {
  return {
    category: "conteúdo",
    title: "",
    description: "",
    impact: "Alto",
    complexity: "Média",
    priority: "ALTA",
  };
}

const DEFAULT_NO_WEBSITE =
  "A ausência de um site representa uma oportunidade de construção de autoridade, presença digital e geração de oportunidades.";

function toNum(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function emptyProposalDraft(opts?: {
  clientId?: string;
  companyName?: string;
  noWebsiteCopy?: string;
  website?: string | null;
}): ProposalDraft {
  const company = opts?.companyName ?? "";
  return {
    clientId: opts?.clientId ?? "",
    title: company ? `Proposta comercial · ${company}` : "",
    coverHeadline: "Transformando presença digital em crescimento.",
    coverSubheadline: company ? `Uma leitura estratégica para ${company}.` : "",
    contextBody: "",
    roiBody: "",
    packageId: "",
    monthlyReais: 0,
    setupReais: 0,
    durationMonths: 12,
    publish: false,
    diagnostic: {
      instagramScore: 0,
      googleScore: 0,
      websiteScore: 0,
      contentScore: 0,
      positioningScore: 0,
      conversionScore: 0,
      overallScore: 0,
      interpretation: "",
      hasWebsite: Boolean(opts?.website),
      noWebsiteCopy: opts?.noWebsiteCopy || DEFAULT_NO_WEBSITE,
      instagramFollowers: null,
      engagementRate: null,
      postingFrequency: "",
      googleReviews: null,
      googleRating: null,
      websiteUrl: opts?.website ?? "",
    },
    problems: [emptyProblem()],
    opportunities: [emptyOpportunity()],
    serviceIds: [],
  };
}

type LoadedProposal = {
  id: string;
  clientId: string;
  title: string;
  coverHeadline: string;
  coverSubheadline: string | null;
  monthlyValue: number;
  setupValue: number;
  durationMonths: number;
  packageId: string | null;
  sections: { type: string; body: string | null }[];
  services: { serviceId: string }[];
  problems: ProblemDraft[];
  opportunities: OpportunityDraft[];
  diagnostic: {
    instagramScore: number | null;
    googleScore: number | null;
    websiteScore: number | null;
    contentScore: number | null;
    positioningScore: number | null;
    conversionScore: number | null;
    overallScore: number | null;
    interpretation: string | null;
    hasWebsite: boolean;
    noWebsiteCopy: string | null;
    instagramAnalysis: {
      followers: number | null;
      engagementRate: unknown;
      postingFrequency: string | null;
    } | null;
    googleAnalysis: {
      reviewCount: number | null;
      rating: unknown;
    } | null;
    websiteAnalysis: { url: string | null } | null;
  } | null;
};

export function proposalToDraft(proposal: LoadedProposal, noWebsiteCopy?: string): ProposalDraft {
  const fallback = emptyProposalDraft({ clientId: proposal.clientId, noWebsiteCopy });
  const diagnostic = proposal.diagnostic;
  return {
    ...fallback,
    id: proposal.id,
    clientId: proposal.clientId,
    title: proposal.title,
    coverHeadline: proposal.coverHeadline,
    coverSubheadline: proposal.coverSubheadline ?? "",
    contextBody: proposal.sections.find((section) => section.type === "context")?.body ?? "",
    roiBody: proposal.sections.find((section) => section.type === "roi")?.body ?? "",
    packageId: proposal.packageId ?? "",
    monthlyReais: centsToReais(proposal.monthlyValue),
    setupReais: centsToReais(proposal.setupValue),
    durationMonths: proposal.durationMonths,
    serviceIds: proposal.services.map((item) => item.serviceId),
    problems: proposal.problems.length ? proposal.problems : [emptyProblem()],
    opportunities: proposal.opportunities.length ? proposal.opportunities : [emptyOpportunity()],
    diagnostic: diagnostic
      ? {
          instagramScore: diagnostic.instagramScore ?? 0,
          googleScore: diagnostic.googleScore ?? 0,
          websiteScore: diagnostic.websiteScore ?? 0,
          contentScore: diagnostic.contentScore ?? 0,
          positioningScore: diagnostic.positioningScore ?? 0,
          conversionScore: diagnostic.conversionScore ?? 0,
          overallScore: diagnostic.overallScore ?? 0,
          interpretation: diagnostic.interpretation ?? "",
          hasWebsite: diagnostic.hasWebsite,
          noWebsiteCopy: diagnostic.noWebsiteCopy || noWebsiteCopy || DEFAULT_NO_WEBSITE,
          instagramFollowers: diagnostic.instagramAnalysis?.followers ?? null,
          engagementRate: toNum(diagnostic.instagramAnalysis?.engagementRate),
          postingFrequency: diagnostic.instagramAnalysis?.postingFrequency ?? "",
          googleReviews: diagnostic.googleAnalysis?.reviewCount ?? null,
          googleRating: toNum(diagnostic.googleAnalysis?.rating),
          websiteUrl: diagnostic.websiteAnalysis?.url ?? "",
        }
      : fallback.diagnostic,
  };
}
