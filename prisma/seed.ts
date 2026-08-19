import { PrismaClient, Priority, Recurrence, Role, TemplateKey, ProposalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.proposalEvent.deleteMany();
  await prisma.proposalView.deleteMany();
  await prisma.proposalAcceptance.deleteMany();
  await prisma.proposalService.deleteMany();
  await prisma.proposalSection.deleteMany();
  await prisma.instagramAnalysis.deleteMany();
  await prisma.googleAnalysis.deleteMany();
  await prisma.websiteAnalysis.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.diagnostic.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.package.deleteMany();
  await prisma.service.deleteMany();
  await prisma.proposalTemplate.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationSettings.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Moove",
      slug: "moove",
      settings: {
        create: {
          whatsappUrl: "https://wa.me/5532999990000",
          meetingUrl: "https://cal.com/moove",
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash("moove2026", 12);

  const owner = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: "Caio Henrique",
      email: "comercial@moove.com.br",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const templates = [
    { key: TemplateKey.DARK, name: "Moove Dark", description: "Tecnológico, cinematográfico, o padrão da casa." },
    { key: TemplateKey.EXECUTIVE, name: "Moove Executive", description: "Corporativo, mais respiração, menos glow." },
    { key: TemplateKey.MINIMAL, name: "Moove Minimal", description: "Tipografia e espaço. Quase silêncio." },
    { key: TemplateKey.FUTURE, name: "Moove Future", description: "Mais mesh, mais motion, ainda premium." },
  ];

  await prisma.proposalTemplate.createMany({
    data: templates.map((template) => ({ ...template, organizationId: organization.id })),
  });

  const services = await prisma.$transaction([
    prisma.service.create({
      data: {
        organizationId: organization.id,
        slug: "social-media",
        name: "Social Media",
        tagline: "Transformamos seu Instagram em um ativo estratégico de aquisição e autoridade.",
        description: "Gestão estratégica de conteúdo com ritmo editorial, posicionamento e leitura contínua de desempenho.",
        benefits: ["Autoridade consistente", "Frequência previsível", "Conteúdo com intenção comercial"],
        deliverables: ["Calendário mensal", "Peças e legendas", "Relatório de performance"],
        defaultPrice: 200000,
        recurrence: Recurrence.MONTHLY,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: organization.id,
        slug: "trafego-pago",
        name: "Tráfego pago",
        tagline: "Colocamos a oferta certa na frente de quem já está procurando o que vocês resolvem.",
        description: "Aquisição de clientes por mídia paga com criativos alinhados à estratégia, não a campanhas isoladas.",
        benefits: ["Demanda qualificada", "Aprendizado de criativo", "Escala controlada"],
        deliverables: ["Estrutura de campanhas", "Criativos", "Otimização semanal"],
        defaultPrice: 250000,
        recurrence: Recurrence.MONTHLY,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: organization.id,
        slug: "website",
        name: "Website",
        tagline: "Construímos uma presença digital preparada para transformar visitantes em oportunidades.",
        description: "Site de alta conversão com narrativa, prova e caminhos claros até o contato.",
        benefits: ["Autoridade", "SEO de base", "Jornada própria"],
        deliverables: ["Arquitetura", "Design", "Desenvolvimento", "Publicação"],
        defaultPrice: 350000,
        recurrence: Recurrence.ONE_TIME,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: organization.id,
        slug: "seo",
        name: "SEO",
        tagline: "Fazemos a empresa aparecer quando o cliente certo está pesquisando.",
        description: "Posicionamento orgânico local e de conteúdo, com prioridade no que gera conversa comercial.",
        benefits: ["Descoberta contínua", "Menos dependência de mídia", "Autoridade temática"],
        deliverables: ["Auditoria", "Páginas-alvo", "Conteúdo e técnico"],
        defaultPrice: 150000,
        recurrence: Recurrence.MONTHLY,
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: organization.id,
        slug: "automacao",
        name: "Automação",
        tagline: "O comercial deixa de depender de memória e passa a operar com um sistema.",
        description: "Automação da jornada: captura, nutrição, follow-up e handoff para o time.",
        benefits: ["Resposta rápida", "Menos lead perdido", "Rotina previsível"],
        deliverables: ["Fluxos", "Integrações", "Playbook de atendimento"],
        defaultPrice: 200000,
        recurrence: Recurrence.MONTHLY,
        sortOrder: 5,
      },
    }),
  ]);

  const growth = await prisma.package.create({
    data: {
      organizationId: organization.id,
      slug: "growth",
      name: "Growth",
      monthlyPrice: 490000,
      setupPrice: 150000,
      description: "Estratégia, conteúdo, site e aquisição no mesmo ritmo.",
      highlights: ["Social media", "Website", "SEO de base", "Rotina comercial"],
      recommended: true,
      sortOrder: 2,
    },
  });

  await prisma.package.createMany({
    data: [
      {
        organizationId: organization.id,
        slug: "start",
        name: "Start",
        monthlyPrice: 250000,
        setupPrice: 0,
        description: "Posicionamento e conteúdo para sair do improviso.",
        highlights: ["Social media", "Diagnóstico contínuo"],
        recommended: false,
        sortOrder: 1,
      },
      {
        organizationId: organization.id,
        slug: "scale",
        name: "Scale",
        monthlyPrice: 750000,
        setupPrice: 250000,
        description: "Operação completa de crescimento, com mídia e automação.",
        highlights: ["Tudo do Growth", "Tráfego pago", "Automação"],
        recommended: false,
        sortOrder: 3,
      },
    ],
  });

  const client = await prisma.client.create({
    data: {
      organizationId: organization.id,
      companyName: "Vértice Arquitetura",
      tradeName: "Vértice",
      segment: "Arquitetura e interiores",
      contactName: "Helena Duarte",
      contactRole: "Sócia",
      phone: "(32) 98888-1200",
      whatsapp: "(32) 98888-1200",
      email: "helena@vertice.arq.br",
      city: "Juiz de Fora",
      state: "MG",
      instagram: "@vertice.arq",
      notes: "Escritório com obra reconhecida, presença digital ainda amadora.",
    },
  });

  const proposal = await prisma.proposal.create({
    data: {
      organizationId: organization.id,
      clientId: client.id,
      ownerId: owner.id,
      packageId: growth.id,
      title: "Estratégia Digital 2026",
      slug: "vertice-arquitetura-a8f92",
      publicToken: "vertice-arquitetura-a8f92",
      status: ProposalStatus.ENVIADA,
      templateKey: TemplateKey.DARK,
      coverHeadline: "Transformando presença digital em crescimento.",
      coverSubheadline: "Uma leitura específica do momento da Vértice — e o caminho para virar referência na cidade.",
      monthlyValue: 490000,
      setupValue: 150000,
      discountValue: 0,
      durationMonths: 12,
      validUntil: new Date("2026-09-30"),
      publishedAt: new Date(),
    },
  });

  await prisma.diagnostic.create({
    data: {
      proposalId: proposal.id,
      instagramScore: 68,
      googleScore: 74,
      websiteScore: 32,
      contentScore: 51,
      positioningScore: 63,
      conversionScore: 42,
      overallScore: 55,
      hasWebsite: false,
      noWebsiteCopy:
        "A ausência de um site representa uma oportunidade de construção de autoridade, presença digital e geração de oportunidades.",
      interpretation:
        "Sua empresa possui uma presença digital ativa, porém existem oportunidades claras para transformar visibilidade em geração consistente de oportunidades comerciais.",
      instagramAnalysis: {
        create: {
          followers: 1240,
          following: 890,
          posts: 86,
          avgLikes: 42,
          avgComments: 3.1,
          engagementRate: 3.4,
          postingFrequency: "Irregular — picos e silêncios",
          avgReach: 980,
          avgViews: 2100,
          bestContent: "Reels de obra em andamento e detalhes de material",
          worstContent: "Posts estáticos institucionais sem contexto",
          visualQuality: 7,
          contentQuality: 5,
          positioning: "Estética forte, discurso ainda genérico",
          bio: "Sem proposta clara nem caminho de conversão",
          cta: "Link na bio aponta para WhatsApp, sem pré-qualificação",
          highlights: "Desatualizados, sem narrativa de projetos",
          visualIdentity: "Boa fotografia de obra, feed sem sistema",
        },
      },
      googleAnalysis: {
        create: {
          hasBusinessProfile: true,
          reviewCount: 18,
          rating: 4.8,
          reviewFrequency: "Baixa — última há 4 meses",
          photos: 6,
          infoUpdated: false,
          appearsOnGoogle: true,
          localPositioning: "Aparece, mas perde para concorrentes com site e volume de avaliação",
          competitors: "Três escritórios locais com site próprio e Google Ads",
          searchPresence: "Marca é buscada; serviços (reforma, interiores JF) quase não rankeiam",
          seoOpportunities: "Páginas de serviço + prova de obra + ficha Google completa",
        },
      },
    },
  });

  await prisma.problem.createMany({
    data: [
      {
        proposalId: proposal.id,
        title: "Baixa frequência de conteúdo",
        description: "O Instagram existe, mas não opera como canal. Sem ritmo, o alcance vira acaso.",
        impact: "A marca some da memória entre uma obra e outra.",
        evidence: "Intervalos de 12 a 20 dias sem publicação nos últimos 90 dias.",
        priority: Priority.ALTA,
        sortOrder: 1,
      },
      {
        proposalId: proposal.id,
        title: "Ausência de posicionamento claro",
        description: "A Vértice é reconhecida por quem já conhece. Quem chega agora não entende o recorte.",
        impact: "O escritório compete por preço em vez de ser escolhido por tese.",
        evidence: "Bio genérica, highlights sem sistema, nenhum manifesto de método.",
        priority: Priority.CRITICA,
        sortOrder: 2,
      },
      {
        proposalId: proposal.id,
        title: "Site inexistente",
        description: "Não há um território próprio. Toda a conversa mora em plataforma alheia.",
        impact: "Google, indicação e anúncio não têm para onde convergir.",
        evidence: "Busca pela marca não entrega vitrine, só redes e menções.",
        priority: Priority.CRITICA,
        sortOrder: 3,
      },
      {
        proposalId: proposal.id,
        title: "Baixa conversão",
        description: "Há interesse. Falta um caminho entre o olhar e a reunião.",
        impact: "Leads chegam quentes no WhatsApp e esfriam sem qualificação.",
        evidence: "CTA único para conversa, sem oferta de diagnóstico ou portfólio guiado.",
        priority: Priority.ALTA,
        sortOrder: 4,
      },
    ],
  });

  await prisma.opportunity.createMany({
    data: [
      {
        proposalId: proposal.id,
        category: "conteúdo",
        title: "Obra como evidência",
        description: "Transformar o canteiro e o detalhe construtivo em série editorial semanal.",
        impact: "Alto",
        complexity: "Média",
        priority: Priority.ALTA,
        sortOrder: 1,
      },
      {
        proposalId: proposal.id,
        category: "site",
        title: "Território próprio",
        description: "Um site que narra método, mostra prova e agenda reunião.",
        impact: "Alto",
        complexity: "Média",
        priority: Priority.CRITICA,
        sortOrder: 2,
      },
      {
        proposalId: proposal.id,
        category: "seo",
        title: "Busca local",
        description: "Páginas para reforma, interiores e arquitetura em Juiz de Fora.",
        impact: "Alto",
        complexity: "Média",
        priority: Priority.ALTA,
        sortOrder: 3,
      },
      {
        proposalId: proposal.id,
        category: "geração de leads",
        title: "Diagnóstico como porta",
        description: "Trocar “fale conosco” por um convite específico: leitura do projeto.",
        impact: "Alto",
        complexity: "Baixa",
        priority: Priority.ALTA,
        sortOrder: 4,
      },
    ],
  });

  await prisma.proposalService.createMany({
    data: [
      { proposalId: proposal.id, serviceId: services[0].id, quantity: 1, price: 200000 },
      { proposalId: proposal.id, serviceId: services[2].id, quantity: 1, price: 350000 },
      { proposalId: proposal.id, serviceId: services[3].id, quantity: 1, price: 150000 },
    ],
  });

  const sections: Array<{
    type: string;
    title: string;
    subtitle?: string;
    body?: string;
    sortOrder: number;
  }> = [
    {
      type: "cover",
      title: "Capa",
      subtitle: "Transformando presença digital em crescimento.",
      sortOrder: 1,
    },
    {
      type: "context",
      title: "Entendemos o seu momento.",
      body: "A Vértice já constrói com rigor. O que falta não é talento — é um sistema que faça o mercado perceber isso com a mesma clareza de quem visita a obra.",
      sortOrder: 2,
    },
    {
      type: "diagnostic",
      title: "Encontramos estas oportunidades.",
      sortOrder: 3,
    },
    {
      type: "problems",
      title: "O que está impedindo seu crescimento.",
      sortOrder: 4,
    },
    {
      type: "opportunities",
      title: "Onde podemos gerar impacto.",
      sortOrder: 5,
    },
    {
      type: "strategy",
      title: "Como vamos resolver.",
      body: "Uma metodologia em oito movimentos — do diagnóstico à escala.",
      sortOrder: 6,
    },
    {
      type: "plan",
      title: "O que será executado.",
      sortOrder: 7,
    },
    {
      type: "investment",
      title: "Quanto custa essa transformação.",
      sortOrder: 8,
    },
    {
      type: "roi",
      title: "O que pode ser construído.",
      body: "Em doze meses, a Vértice deixa de ser um escritório que as pessoas descobrem por indicação tardia e passa a ser encontrado — com tese, prova e conversa comercial.",
      sortOrder: 9,
    },
    {
      type: "cta",
      title: "Vamos começar?",
      subtitle: "Pronto para o próximo nível?",
      sortOrder: 10,
    },
  ];

  await prisma.proposalSection.createMany({
    data: sections.map((section) => ({ ...section, proposalId: proposal.id })),
  });

  await prisma.client.create({
    data: {
      organizationId: organization.id,
      companyName: "Ateliê Lume",
      tradeName: "Lume",
      segment: "Gastronomia",
      contactName: "Pedro Vale",
      contactRole: "Fundador",
      city: "Juiz de Fora",
      state: "MG",
      instagram: "@atelielume",
    },
  });

  const draft = await prisma.proposal.create({
    data: {
      organizationId: organization.id,
      clientId: client.id,
      ownerId: owner.id,
      title: "Revisão de mídia — rascunho",
      slug: "vertice-midia-rascunho",
      publicToken: "vertice-midia-draft",
      status: ProposalStatus.RASCUNHO,
      monthlyValue: 250000,
    },
  });

  await prisma.proposal.create({
    data: {
      organizationId: organization.id,
      clientId: client.id,
      ownerId: owner.id,
      title: "Scale 2026",
      slug: "vertice-scale-2026",
      publicToken: "vertice-scale",
      status: ProposalStatus.VISUALIZADA,
      monthlyValue: 750000,
      publishedAt: new Date(),
    },
  });

  await prisma.proposalEvent.createMany({
    data: [
      { proposalId: proposal.id, sessionId: "demo-1", type: "proposal_opened" },
      { proposalId: proposal.id, sessionId: "demo-1", type: "section_viewed", section: "investment" },
      { proposalId: proposal.id, sessionId: "demo-1", type: "cta_clicked" },
    ],
  });

  console.log("Seed ok");
  console.log("Login: comercial@moove.com.br / moove2026");
  console.log(`Proposta pública: /p/${proposal.slug}`);
  console.log(`Rascunho: ${draft.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
