# Moove Propostas

Plataforma para criar e enviar propostas comerciais digitais da Moove.

## Stack

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · Recharts · Prisma · PostgreSQL · Auth.js

## Setup

1. PostgreSQL local com o banco `moove_propostas`
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `AUTH_SECRET`
3. Instale e suba o schema:

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Acesso

- Admin: http://localhost:3001/login  
  `comercial@moove.com.br` / `moove2026`
- Proposta demo: http://localhost:3001/p/vertice-arquitetura-a8f92

## Marca

- `public/brand/wordmark.png` — wordmark com degradê (topo, capa)
- `public/brand/mark.png` — símbolo 3D (favicon, capa, mobile)
- `public/brand/lockup.png` — lockup mono (rodapé da proposta)
