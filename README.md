# WalletLog

Family financial tracker — income, expenses, balance, and monthly statistics. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- CRUD income sources (salary, bonus, THR, etc.)
- CRUD expense groups with items (price × quantity)
- Remaining balance with color indicator (green / yellow / red)
- Expense breakdown with progress bars
- Statistics: pie chart, 6-month bar chart
- 3-month sliding window navigation
- Copy data from previous month
- IDR currency formatting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **State**: Zustand

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local install or Docker)

## Local Setup

### 1. Clone the repo

```bash
git clone git@github.com:gilangprathama/wallet-log.git
cd wallet-log
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup PostgreSQL

**Option A — Homebrew (macOS)**
```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s walletlog
createdb -O walletlog walletlog
psql -c "ALTER USER walletlog WITH PASSWORD 'walletlog123';"
```

**Option B — Docker**
```bash
docker compose up -d
```

### 4. Configure environment

```bash
cp .env.example .env
```

`.env` default (matches both options above):
```
DATABASE_URL="postgresql://walletlog:walletlog123@localhost:5432/walletlog"
```

### 5. Push schema & seed data

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 6. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Scripts

| Command | Description |
|---|---|
| `npm run db:seed` | Seed sample data for current month |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:migrate` | Run Prisma migrations (requires CREATEDB privilege) |

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (income, expenses, months)
│   ├── expenses/     # Expenses page
│   ├── income/       # Income page
│   ├── statistics/   # Statistics page
│   └── page.tsx      # Dashboard
├── components/
│   ├── layout/       # Sidebar, MobileHeader
│   └── ui/           # Modal, MonthNavigator, etc.
├── hooks/            # useMonthData, useMonthNavigation
├── lib/              # Prisma client, utils
├── store/            # Zustand store
└── types/            # TypeScript interfaces
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed script
```
