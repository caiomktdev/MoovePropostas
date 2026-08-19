import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  slug: z.string().min(3),
  type: z.string().min(2),
  section: z.string().optional(),
  sessionId: z.string().min(4),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const proposal = await prisma.proposal.findFirst({
    where: { slug: body.data.slug },
    select: { id: true, status: true },
  });
  if (!proposal) return NextResponse.json({ ok: false }, { status: 404 });

  await prisma.proposalEvent.create({
    data: {
      proposalId: proposal.id,
      sessionId: body.data.sessionId,
      type: body.data.type,
      section: body.data.section,
    },
  });

  if (body.data.type === "proposal_opened" && proposal.status === "ENVIADA") {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "VISUALIZADA" },
    });
  }

  return NextResponse.json({ ok: true });
}
