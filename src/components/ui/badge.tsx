import { cn } from "@/lib/utils";
import type { ProposalStatus, Priority } from "@prisma/client";

const STATUS: Record<ProposalStatus, string> = {
  RASCUNHO: "Rascunho",
  REVISAO: "Revisão",
  ENVIADA: "Enviada",
  VISUALIZADA: "Visualizada",
  EM_NEGOCIACAO: "Em negociação",
  APROVADA: "Aprovada",
  PERDIDA: "Perdida",
};

const PRIORITY: Record<Priority, { label: string; className: string }> = {
  CRITICA: { label: "Crítica", className: "text-crit bg-crit/10" },
  ALTA: { label: "Alta", className: "text-high bg-high/10" },
  MEDIA: { label: "Média", className: "text-mid bg-mid/10" },
  BAIXA: { label: "Baixa", className: "text-low bg-low/10" },
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className="inline-flex rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
      {STATUS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const item = PRIORITY[priority];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        item.className,
      )}
    >
      {item.label}
    </span>
  );
}
