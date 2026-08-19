import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function NotFound() {
  return (
    <main className="mesh flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <BrandLogo variant="mark" className="mb-6 h-14 w-auto" />
      <p className="text-xs uppercase tracking-[0.28em] text-lilac">404</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Essa página não existe.</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        A proposta pública vive em /p/… O painel da equipe começa no login.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          Ir para o login
        </Link>
        <Link
          href="/p/vertice-arquitetura-a8f92"
          className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm"
        >
          Ver proposta demo
        </Link>
      </div>
    </main>
  );
}
