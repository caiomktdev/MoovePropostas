"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function acceptProposal(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const agreed = formData.get("agreed") === "on";

  if (!slug || !name || !role || !email || !agreed) {
    return { error: "Preencha os campos obrigatórios e confirme o aceite." };
  }

  const proposal = await prisma.proposal.findFirst({
    where: { slug },
    include: { acceptance: true },
  });
  if (!proposal) return { error: "Proposta não encontrada." };
  if (proposal.acceptance) return { error: "Esta proposta já foi aceita." };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerList.get("x-real-ip");

  await prisma.$transaction([
    prisma.proposalAcceptance.create({
      data: {
        proposalId: proposal.id,
        name,
        role,
        email,
        phone: phone || null,
        agreed: true,
        ip,
      },
    }),
    prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "APROVADA" },
    }),
    prisma.proposalEvent.create({
      data: {
        proposalId: proposal.id,
        sessionId: "acceptance",
        type: "proposal_accepted",
      },
    }),
  ]);

  revalidatePath(`/p/${slug}`);
  return { ok: true };
}
