# Fits Ops OS

**Sistema de Gestão Operacional Inteligente** — Fitbank Diretoria de Operações

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Recharts |
| Backend | NestJS, TypeScript |
| Banco | PostgreSQL + Prisma ORM |
| Auth | JWT (ADMIN / VIEWER) |
| IA | OpenAI GPT-4o |

## Setup Local

### 1. Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente
- Conta OpenAI com API Key

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edite `.env` e `apps/api/.env` com:
- `DATABASE_URL` — string de conexão do PostgreSQL
- `JWT_SECRET` — segredo seguro (gere com `openssl rand -hex 32`)
- `OPENAI_API_KEY` — sua chave da OpenAI

### 4. Banco de dados

```bash
npm run db:generate   # gera o Prisma Client
npm run db:migrate    # aplica as migrations
npm run db:seed       # popula com dados demo
```

### 5. Rodar em desenvolvimento

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Frontend
npm run dev:web
```

Acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Docs Swagger**: http://localhost:3001/api/docs

### Credenciais Demo

| Email | Senha | Role |
|-------|-------|------|
| admin@fitbank.com | admin123 | ADMIN |
| viewer@fitbank.com | viewer123 | VIEWER |

## Deploy

### Railway (Backend + PostgreSQL)

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione o plugin PostgreSQL
3. Faça deploy da pasta `apps/api`
4. Configure as variáveis de ambiente
5. Railway injetará `DATABASE_URL` automaticamente

### Vercel (Frontend)

1. Importe o repositório no [Vercel](https://vercel.com)
2. Configure root directory: `apps/web`
3. Adicione `NEXT_PUBLIC_API_URL` apontando para a URL do Railway

## Funcionalidades

- **Dashboard Executivo** — Score geral, categorias, gráficos, alertas, IA
- **Gestão de KPIs** — CRUD completo com soft delete
- **Input Mensal** — Tabela dinâmica com edição inline
- **Análise de Performance** — Semáforo, histórico, filtros
- **Planos de Ação** — CRUD, status tracking, sugestão via IA
- **IA** — Diagnóstico executivo, sugestão de planos, insights mensais

## Regras de Negócio

```
Atingimento UP:   (realizado / meta) × 100
Atingimento DOWN: (meta / realizado) × 100

Status GREEN:  ≥ 100%
Status YELLOW: 80–99%
Status RED:    < 80%
```
