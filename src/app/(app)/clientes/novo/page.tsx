import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { publicToken, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function NewClientPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl pb-20">
      <p className="text-xs uppercase tracking-[0.28em] text-lilac">Etapa 01</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Dados da empresa</h1>
      <form action={createClient} className="mt-10 grid gap-4">
        <Field name="companyName" label="Nome da empresa" required />
        <Field name="tradeName" label="Nome fantasia" />
        <Field name="segment" label="Segmento" />
        <Field name="contactName" label="Responsável" />
        <Field name="contactRole" label="Cargo" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="phone" label="Telefone" />
          <Field name="whatsapp" label="WhatsApp" />
        </div>
        <Field name="email" label="E-mail" type="email" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="city" label="Cidade" />
          <Field name="state" label="Estado" />
        </div>
        <Field name="website" label="Website" />
        <Field name="instagram" label="Instagram" />
        <Field name="facebook" label="Facebook" />
        <Field name="tiktok" label="TikTok" />
        <Field name="googleMaps" label="Google Maps" />
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Observações</span>
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-2xl border border-line bg-white/4 px-4 py-3 outline-none focus:border-lilac/50"
          />
        </label>
        <Button type="submit" size="lg">
          Salvar cliente
        </Button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 w-full rounded-2xl border border-line bg-white/4 px-4 outline-none focus:border-lilac/50"
      />
    </label>
  );
}

async function createClient(formData: FormData) {
  "use server";
  const user = await requireUser();
  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) return;

  const client = await prisma.client.create({
    data: {
      organizationId: user.organizationId,
      companyName,
      tradeName: String(formData.get("tradeName") ?? "") || null,
      segment: String(formData.get("segment") ?? "") || null,
      contactName: String(formData.get("contactName") ?? "") || null,
      contactRole: String(formData.get("contactRole") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      whatsapp: String(formData.get("whatsapp") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      city: String(formData.get("city") ?? "") || null,
      state: String(formData.get("state") ?? "") || null,
      website: String(formData.get("website") ?? "") || null,
      instagram: String(formData.get("instagram") ?? "") || null,
      facebook: String(formData.get("facebook") ?? "") || null,
      tiktok: String(formData.get("tiktok") ?? "") || null,
      googleMaps: String(formData.get("googleMaps") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  const token = publicToken();
  await prisma.proposal.create({
    data: {
      organizationId: user.organizationId,
      clientId: client.id,
      ownerId: user.id,
      title: `Proposta comercial · ${companyName}`,
      slug: `${slugify(companyName)}-${token}`,
      publicToken: `${slugify(companyName)}-${token}`,
      status: "RASCUNHO",
    },
  });

  redirect(`/clientes/${client.id}`);
}
