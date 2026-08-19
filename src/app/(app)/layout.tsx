import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AdminShell userName={user.name ?? "Moove"}>{children}</AdminShell>;
}
