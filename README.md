# FlyMy.Pet

**Telegram-first pet relocation platform from the UAE to Europe.**

A lightweight MVP for coordinating pet relocations, built as a service under Yureka Media. Customers onboard entirely through a Telegram bot, while staff manage operations through a web-based admin panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 + Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Bot | Telegraf (Telegram Bot API) |
| Language | TypeScript |
| Icons | Lucide React |

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│  Marketing Site  │     │ Telegram Bot │     │   Admin    │
│  (Next.js SSR)   │     │  (Telegraf)  │     │  Dashboard │
│                  │     │              │     │ (Next.js)  │
│  /               │     │  @FlyMyPetBot│     │  /admin    │
│  /how-it-works   │     │              │     │            │
│  /pricing        │     │  Onboarding  │     │ Customers  │
│  /rescue         │     │  flow with   │     │ Documents  │
│                  │     │  doc upload  │     │ Relocations│
└────────┬─────────┘     └──────┬───────┘     └─────┬──────┘
         │                      │                    │
         └──────────────────────┼────────────────────┘
                                │
                     ┌──────────▼──────────┐
                     │   API Routes        │
                     │  /api/webhook       │
                     │  /api/relocations   │
                     │  /api/documents     │
                     │  /api/stats         │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │   PostgreSQL        │
                     │   (Prisma ORM)      │
                     │                     │
                     │   users             │
                     │   pets              │
                     │   relocations       │
                     │   documents         │
                     │   flights           │
                     │   volunteers        │
                     │   sponsorships      │
                     │   onboard_states    │
                     └─────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** 18 or later
- **PostgreSQL** database (local or hosted)
- **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)

### 1. Clone and install

```bash
cd flymypet
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flymypet"
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"
NEXT_PUBLIC_TELEGRAM_BOT_URL="https://t.me/YourBotName"

# Human support for escape hatch (when user says "help" or "urgent")
# Use a real person's @username, NOT a bot — users message them directly
TELEGRAM_SUPPORT_USERNAME="FlyMyPetSupport"
```

### 3. Set up database

```bash
npx prisma db push      # Create tables from schema
npm run db:seed          # (Optional) Load sample data
```

### 4. Start development

```bash
# Terminal 1 — Website + Admin + API
npm run dev

# Terminal 2 — Telegram bot (polling mode)
npm run bot:dev
```

- Website: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page (Framer Motion)
│   ├── (marketing)/                      # Marketing sub-pages
│   │   ├── how-it-works/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── rescue/page.tsx
│   ├── admin/                            # Admin dashboard
│   │   ├── page.tsx                      # Overview stats
│   │   ├── customers/page.tsx            # All TG customers
│   │   ├── documents/page.tsx            # Uploaded documents
│   │   ├── relocations/                  # Relocation management
│   │   │   ├── page.tsx                  # List + filters
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Detail view
│   │   │       └── StatusUpdateForm.tsx  # Status updater
│   │   ├── flights/page.tsx
│   │   └── volunteers/page.tsx
│   └── api/
│       ├── webhook/route.ts              # Telegram webhook
│       ├── relocations/
│       │   ├── route.ts                  # List
│       │   └── [id]/route.ts             # Detail + PATCH
│       ├── documents/[id]/approve/       # Doc approval
│       └── stats/route.ts                # Analytics
├── bot/
│   ├── index.ts                          # Bot setup + commands
│   └── handlers.ts                       # Onboarding conversation
├── components/
│   ├── Header.tsx                        # Marketing header
│   └── Footer.tsx                        # Marketing footer
└── lib/
    ├── prisma.ts                         # DB client singleton
    ├── constants.ts                      # Shared config
    └── notifications.ts                  # TG notification sender
```

## Customer Journey

```
Website (flymypet.com)
  └─ Click "Start Pet Relocation"
      └─ Opens Telegram → @FlyMyPetBot
          └─ /start command triggers onboarding flow
              ├── Step 1: Owner info (name, phone, email, city)
              ├── Step 2: Pet info (type, breed, age, weight, microchip)
              ├── Step 3: Travel info (origin, destination, date, flexibility)
              └── Step 4: Document upload (vaccination, rabies, passport, ID)
                  └─ Data saved to PostgreSQL CRM
                      └─ Visible in Admin Panel at /admin
```

## Telegram Bot

### Commands

| Command | Description |
|---|---|
| `/start` | Begin onboarding — structured Q&A flow |
| `/status` | Check current relocation status |
| `/volunteer` | Register as a flight companion volunteer |
| `/sponsor` | Learn about rescue sponsorship |

### Onboarding Flow

The bot guides users through a step-by-step conversation. Each response is validated and saved to the database in real-time. The `onboard_states` table tracks where each user is in the flow.

Steps: `owner_name` → `owner_phone` → `owner_email` → `owner_city` → `pet_type` → `pet_breed` → `pet_age` → `pet_weight` → `pet_microchip` → `travel_origin` → `travel_destination` → `travel_date` → `travel_flex` → `documents` → `complete`

### Document Upload

Users send photos or files directly in the Telegram chat. The bot stores the Telegram file ID and categorizes documents by upload order (vaccination card → rabies cert → pet passport → owner ID).

## Admin Panel

Accessible at `/admin`. Provides a CRM-style view of all data captured through Telegram.

### Dashboard (`/admin`)
- Stat cards: customers, pets, active relocations, documents
- Relocation pipeline breakdown by status
- Recent customers and recent document uploads

### Customers (`/admin/customers`)
- Full list of everyone who started the Telegram bot
- Search by name, email, phone, or Telegram ID
- Shows onboarding progress, pet count, document count, relocation status
- Paginated

### Documents (`/admin/documents`)
- All files uploaded via Telegram
- Filter by document type or approval status
- Type summary cards (vaccination, rabies, passport, ID)
- One-click approval workflow

### Relocations (`/admin/relocations`)
- Filter by status and destination country
- Click through to detail view with full owner, pet, travel, and document info
- Update relocation status (triggers Telegram notification to customer)
- Add internal notes

### Flights & Volunteers
- Manage flight records and volunteer registrations

## Relocation Status Pipeline

```
submitted → documents_pending → vet_verification → flight_matching → confirmed → in_transit → delivered
```

When an admin updates status, the customer automatically receives a Telegram notification with a status-specific message.

## Database Schema

8 tables managed via Prisma:

- **users** — Customer profiles (from Telegram)
- **pets** — Pet records linked to owners
- **relocations** — Travel requests with status tracking
- **documents** — Uploaded files (TG file IDs)
- **flights** — Flight records
- **volunteers** — Flight companion registrations
- **sponsorships** — Rescue donation records
- **onboard_states** — Tracks each user's position in the TG onboarding flow

Run `npx prisma studio` to browse the database visually.

## Supported Routes

| Origin | Destinations |
|---|---|
| Dubai (DXB) | Spain, Portugal, Romania, Russia |
| Abu Dhabi (AUH) | Spain, Portugal, Romania, Russia |
| Sharjah (SHJ) | Spain, Portugal, Romania, Russia |

## Deployment

### Production Bot (Webhook Mode)

Instead of polling, set the Telegram webhook for production:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/webhook",
    "secret_token": "your-webhook-secret"
  }'
```

Set `TELEGRAM_WEBHOOK_SECRET` in your `.env` to match.

**Scripts:** Use `npm run webhook:set -- https://YOUR_NGROK_OR_DOMAIN` to set the webhook, or add `WEBHOOK_URL` to `.env` and run `npm run webhook:set`. Use `npm run webhook:get` to check the current webhook.

### Database

```bash
npx prisma migrate deploy
```

### Hosting

Optimized for deployment on Vercel (website + API) with a managed PostgreSQL provider (Neon, Supabase, Railway).

### GitHub Pages (Static Landing Only)

The marketing site (landing, how-it-works, pricing, rescue, requirements) can be deployed as a static export to GitHub Pages:

1. **Enable GitHub Pages** in repo Settings → Pages → Source: GitHub Actions.
2. Push to `main` (or `master`). The `.github/workflows/deploy-gh-pages.yml` workflow builds the static export and deploys to `https://<user>.github.io/flymypet/`.

**Build locally:**
```bash
npm run build:static
# Output in ./out — deploy to any static host
```

*Note: API routes and admin panel are excluded from the static build. Use Vercel or similar for the full app.*

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run build:static` | Static export for GitHub Pages (excludes API/admin) |
| `npm run bot:dev` | Start Telegram bot (watch mode) |
| `npm run bot` | Start Telegram bot (production) |
| `npm run webhook:set` | Set Telegram webhook (requires WEBHOOK_URL in .env or URL as arg) |
| `npm run webhook:get` | Show current webhook URL |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## License

Private — Yureka Media
