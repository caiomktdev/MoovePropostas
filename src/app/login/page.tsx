import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/admin/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mesh relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 grid-tech opacity-60" />
      <div className="relative flex w-full max-w-md flex-col items-center">
        <BrandLogo variant="mark" className="mb-6 h-16 w-auto" priority />
        <BrandLogo variant="wordmark" className="mb-10 h-9 w-auto" priority />
        <p className="mb-8 text-center text-sm text-muted">
          Acesso da equipe comercial. A proposta do cliente vive em outro lugar —
          mais silenciosa, mais precisa.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
