"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { logoutAction } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/propostas", label: "Propostas", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="mesh min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/80 px-5 py-6 backdrop-blur-xl md:flex">
        <Link href="/dashboard" className="mb-10 block px-1">
          <BrandLogo variant="wordmark" className="h-8 w-auto" priority />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/8 text-ink"
                    : "text-muted hover:bg-white/5 hover:text-ink",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-line bg-white/3 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-faint">Responsável</p>
            <p className="mt-1 text-sm text-ink">{userName}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/70 px-5 py-3 backdrop-blur-xl md:hidden">
          <BrandLogo variant="mark" className="h-8 w-auto" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Propostas</p>
        </header>
        <div className="px-5 py-8 md:px-10">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface/90 backdrop-blur-xl md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-[0.14em]",
                active ? "text-lilac" : "text-muted",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
