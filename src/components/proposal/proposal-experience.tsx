"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ScoreRing } from "@/components/proposal/score-ring";
import { PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcceptanceForm } from "@/components/proposal/acceptance-form";
import { annualInvestment, formatCurrency, formatNumber } from "@/lib/utils";
import type { PublicProposal } from "@/lib/proposals";

const NAV = [
  { id: "visao", label: "Visão geral" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "estrategia", label: "Estratégia" },
  { id: "plano", label: "Plano" },
  { id: "investimento", label: "Investimento" },
  { id: "proximos", label: "Próximos passos" },
];

const METHOD = [
  "Diagnóstico",
  "Estratégia",
  "Posicionamento",
  "Conteúdo",
  "Aquisição",
  "Conversão",
  "Análise",
  "Escala",
];

const fade = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ProposalExperience({ proposal }: { proposal: PublicProposal }) {
  const [active, setActive] = useState("visao");
  const sessionId = useMemo(() => {
    if (typeof crypto === "undefined") return "session";
    return crypto.randomUUID();
  }, []);

  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const key = `moove-opened:${proposal.slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    void fetch("/api/public/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: proposal.slug, type: "proposal_opened", sessionId }),
    });
  }, [proposal.slug, sessionId]);

  useEffect(() => {
    const nodes = NAV.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        setActive(visible.target.id);
        const eventKey = `section:${visible.target.id}`;
        if (tracked.current.has(eventKey)) return;
        tracked.current.add(eventKey);
        void fetch("/api/public/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: proposal.slug,
            type: "section_viewed",
            section: visible.target.id,
            sessionId,
          }),
        });
      },
      { threshold: 0.35 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [proposal.slug, sessionId]);

  const diagnostic = proposal.diagnostic;
  const annual = annualInvestment(
    proposal.monthlyValue,
    proposal.durationMonths,
    proposal.setupValue,
    proposal.discountValue,
  );
  const aLaCarte = proposal.services.reduce((sum, item) => sum + item.price, 0);
  const valid = proposal.validUntil
    ? new Date(proposal.validUntil).toLocaleDateString("pt-BR")
    : null;

  function trackCta() {
    void fetch("/api/public/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: proposal.slug, type: "cta_clicked", sessionId }),
    });
  }

  return (
    <div className="mesh relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grid-tech opacity-40" />

      <aside className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 lg:block">
        <nav className="space-y-2">
          {NAV.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-3 text-xs uppercase tracking-[0.16em] transition ${
                active === item.id ? "text-ink" : "text-faint hover:text-muted"
              }`}
            >
              <span className="w-6 text-lilac/80">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <nav className="sticky top-0 z-30 flex gap-3 overflow-x-auto border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
              active === item.id ? "bg-white/10 text-ink" : "text-muted"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <main className="relative mx-auto max-w-5xl px-5 pb-28 pt-10 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <BrandLogo variant="wordmark" className="h-7 w-auto" priority />
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Proposta #{String(proposal.number).padStart(3, "0")}
          </p>
        </header>

        <section id="visao" className="relative min-h-[88vh] overflow-hidden rounded-[2rem] border border-line px-6 py-16 md:px-16 md:py-24">
          <BrandLogo
            variant="mark"
            className="pointer-events-none absolute -right-10 -bottom-16 h-72 w-auto opacity-50 md:h-[28rem]"
            priority
          />
          <motion.div variants={fade} initial="hidden" animate="show" className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Proposta comercial para</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
              {proposal.client.companyName}
            </h1>
            <p className="mt-6 text-lg text-muted">{proposal.coverHeadline}</p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted">{proposal.coverSubheadline}</p>
            <div className="mt-10 flex flex-wrap gap-6 text-xs uppercase tracking-[0.18em] text-faint">
              <span>Preparada por {proposal.organization.name}</span>
              <span>{proposal.owner.name}</span>
              {valid ? <span>Válida até {valid}</span> : null}
            </div>
          </motion.div>
        </section>

        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-lilac">Contexto</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Entendemos o seu momento.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {proposal.sections.find((section) => section.type === "context")?.body}
          </p>
        </Reveal>

        <section id="diagnostico" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Raio-x digital</p>
            <h2 className="mt-3 font-display text-4xl">Encontramos estas oportunidades.</h2>
            <div className="relative mt-12 flex flex-wrap justify-center gap-10">
              <ScoreRing value={diagnostic?.overallScore ?? 0} label="Geral" size={168} />
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <ScoreRing value={diagnostic?.instagramScore ?? 0} label="Instagram" />
              <ScoreRing value={diagnostic?.googleScore ?? 0} label="Google" />
              <ScoreRing value={diagnostic?.websiteScore ?? 0} label="Website" />
              <ScoreRing value={diagnostic?.contentScore ?? 0} label="Conteúdo" />
              <ScoreRing value={diagnostic?.positioningScore ?? 0} label="Posicionamento" />
              <ScoreRing value={diagnostic?.conversionScore ?? 0} label="Conversão" />
            </div>
            <blockquote className="mt-12 max-w-3xl text-xl leading-9 text-lilac/90">
              {diagnostic?.interpretation}
            </blockquote>
            {!diagnostic?.hasWebsite ? (
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">{diagnostic?.noWebsiteCopy}</p>
            ) : null}
            {diagnostic?.instagramAnalysis ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Stat label="Seguidores" value={formatNumber(diagnostic.instagramAnalysis.followers ?? 0)} />
                <Stat label="Engajamento" value={`${diagnostic.instagramAnalysis.engagementRate}%`} />
                <Stat label="Google" value={`${diagnostic.googleAnalysis?.rating ?? "—"} · ${diagnostic.googleAnalysis?.reviewCount ?? 0} avaliações`} />
              </div>
            ) : null}
          </Reveal>
        </section>

        <section className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Problemas</p>
            <h2 className="mt-3 font-display text-4xl">O que está impedindo seu crescimento.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {proposal.problems.map((problem, index) => (
                <article
                  key={problem.id}
                  className="rounded-[1.4rem] border border-line bg-surface/70 p-6 transition hover:border-lilac/25"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-faint">
                      Problema {String(index + 1).padStart(2, "0")}
                    </p>
                    <PriorityBadge priority={problem.priority} />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">{problem.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{problem.description}</p>
                  <p className="mt-4 text-sm text-lilac">{problem.impact}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="oportunidades" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Onde podemos crescer</p>
            <h2 className="mt-3 font-display text-4xl">Onde podemos gerar impacto.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {proposal.opportunities.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.4rem] border border-line bg-white/3 p-6 transition hover:-translate-y-0.5 hover:border-lilac/30"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-lilac">{item.category}</p>
                  <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                  <div className="mt-5 flex gap-4 text-xs uppercase tracking-[0.14em] text-faint">
                    <span>Impacto {item.impact}</span>
                    <span>Complexidade {item.complexity}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="estrategia" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Metodologia Moove</p>
            <h2 className="mt-3 font-display text-4xl">Como vamos resolver.</h2>
            <ol className="mt-12 grid gap-3 md:grid-cols-4">
              {METHOD.map((step, index) => (
                <li key={step} className="rounded-2xl border border-line bg-surface/80 px-4 py-5">
                  <p className="text-xs text-lilac">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-display text-xl">{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section id="plano" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Plano</p>
            <h2 className="mt-3 font-display text-4xl">O que será executado.</h2>
            <div className="mt-10 space-y-4">
              {proposal.services.map((item) => (
                <article key={item.id} className="rounded-[1.4rem] border border-line px-6 py-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="font-display text-2xl">{item.service.name}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{item.service.tagline}</p>
                    </div>
                    <p className="text-lilac">{formatCurrency(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="investimento" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Investimento</p>
            <h2 className="mt-3 font-display text-4xl">Quanto custa essa transformação.</h2>
            <div className="mt-10 rounded-[2rem] border border-lilac/25 bg-surface px-8 py-12">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Estratégia + execução + tecnologia</p>
              <p className="mt-4 font-display text-6xl tracking-tight md:text-7xl">
                {formatCurrency(proposal.monthlyValue)}
                <span className="ml-2 text-2xl text-muted">/mês</span>
              </p>
              {proposal.package ? (
                <p className="mt-4 inline-flex rounded-full border border-lilac/30 px-3 py-1 text-xs uppercase tracking-[0.16em] text-lilac">
                  {proposal.package.name} · recomendado
                </p>
              ) : null}
              <p className="mt-6 text-sm text-muted">
                Setup {formatCurrency(proposal.setupValue)} · {proposal.durationMonths} meses · anual {formatCurrency(annual)}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-line p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">O que você recebe</p>
                <ul className="mt-4 space-y-2 text-sm text-ink">
                  {proposal.services.map((item) => (
                    <li key={item.id}>{item.service.name}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.4rem] border border-line p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">O que isso resolve</p>
                <ul className="mt-4 space-y-2 text-sm text-ink">
                  {proposal.problems.map((problem) => (
                    <li key={problem.id}>{problem.title}</li>
                  ))}
                </ul>
              </div>
            </div>
            {aLaCarte > proposal.monthlyValue ? (
              <p className="mt-8 text-sm text-muted">
                Se contratado em separado: {formatCurrency(aLaCarte)}. No plano, o recorte estratégico cabe em{" "}
                {formatCurrency(proposal.monthlyValue)}/mês.
              </p>
            ) : null}
          </Reveal>
        </section>

        <section className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Potencial</p>
            <h2 className="mt-3 font-display text-4xl">O que pode ser construído.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {proposal.sections.find((section) => section.type === "roi")?.body}
            </p>
          </Reveal>
        </section>

        <section id="proximos" className="mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-lilac">Próximo passo</p>
            <h2 className="mt-3 font-display text-5xl">Pronto para o próximo nível?</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#aceite" onClick={trackCta}>
                <Button size="lg">Quero começar</Button>
              </a>
              <a href="https://wa.me/5532999990000" onClick={trackCta}>
                <Button variant="line" size="lg">
                  Falar com a Moove
                </Button>
              </a>
            </div>
            <div id="aceite" className="mt-12 max-w-lg">
              <AcceptanceForm slug={proposal.slug} alreadyAccepted={Boolean(proposal.acceptance)} />
            </div>
          </Reveal>
        </section>

        <footer className="mt-24 flex items-center justify-between border-t border-line pt-8">
          <BrandLogo variant="lockup" className="h-8 w-auto" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Moove · experiência comercial</p>
        </footer>
      </main>
    </div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12%" }}
    >
      {children}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
