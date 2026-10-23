# Aloha RMR — Daily Sales & Weather Logging System

Website 2 of 2 for **Aloha RMR Cafés Shop & Wakito's Pizza**.

Records one daily note per day (weather condition + remarks), reads
sales totals from the shared MongoDB database, and reports
weather-vs-sales patterns. XML export with XXE-disabled parsing.

## Stack

- Next.js 15 (App Router) + TypeScript
- MongoDB Atlas (shared DB `aloha_rmr`)
- Clerk (single-owner auth)
- Tailwind CSS
- pnpm

## Local setup

```bash
cp .env.local.example .env.local   # fill in real values
pnpm install
pnpm db:indexes                    # create Mongo indexes (idempotent)
pnpm dev                           # http://localhost:3000