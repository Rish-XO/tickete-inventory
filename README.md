# Tickete Inventory Sync Backend

A NestJS + Prisma-based backend to integrate and sync external product inventory from Tickete's API with PostgreSQL, complete with rate-limited fetching, scheduled jobs, and normalized data models.

---

## 🚀 Features

- ✅ Sync inventory from Tickete partner API (Product IDs: 14, 15)
- ✅ Rate-limited API fetch (30 requests per minute safe zone)
- ✅ Scheduled syncing every:
  - 15 minutes (for today)
  - 4 hours (for next 7 days) 
  - 1 day (for next 30 days)
- ✅ Manual sync API for dev/ops
- ✅ Fully normalized Postgres schema
- ✅ Two output APIs:
  - `/experience/:id/slots?date=...`
  - `/experience/:id/dates`

---

## 🧱 Tech Stack

- **NestJS** (Modular backend framework)
- **Prisma** (ORM for PostgreSQL)
- **PostgreSQL** (Database)
- **Axios** (HTTP client)
- **@nestjs/schedule** (Cron jobs)
- **date-fns** (Date utilities)

---

## 📦 Setup Instructions

```bash
git clone <repo-url>
cd tickete-inventory
npm install
cp .env.example .env # set your DATABASE_URL here
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts # seeds Product IDs 14 and 15
npm run start:dev
```

---

## 🌐 Available APIs

### 1. GET Slots (for specific date)
```
GET /api/v1/experience/:id/slots?date=YYYY-MM-DD
```
Returns all slots available for a product on a given date.

### 2. GET Available Dates (for 2 months)
```
GET /api/v1/experience/:id/dates
```
Returns all dates with availability and starting price.

### 3. POST Manual Sync (Optional)
```
POST /api/v1/sync?days=7
```
Triggers a manual rate-limited sync for the next X days.

---

## 🔁 Cron-Based Syncing

- **Every 15 minutes** → sync inventory for **today**
- **Every 4 hours** → sync inventory for **next 7 days**
- **Daily at midnight** → sync inventory for **next 30 days**

---

## ⛔ Rate Limit Handling

- API allows 30 requests per minute (30rpm)
- Custom rate limiter adds a `~2200ms delay` between requests
- Ensures compliance even at scale (450 products × 30 days = 13,500 requests spread safely)

---

## 📚 Optimizations & Scale Readiness

- ✅ Rate-limit-safe `rateLimitedFetch()` logic using async delays
- ✅ Normalized DB schema with relational mapping for slot, pax, and price
- ✅ Product-level scheduling enables per-product scaling
- ✅ Pluggable cron system (can be replaced with Redis Queue like BullMQ)
- ✅ Option to expose `/sync/pause` & `/sync/resume` APIs for ops control (future work)

---

## 🧪 Sample Data

Pre-seeded Products:
- `Product 14`: Monday–Wednesday, Multi-time-slot, Pax: Adult, Child
- `Product 15`: Sunday only, Single time-slot, Pax: Adult, Child, Infant

---

## ✅ To-Do / Future Improvements

- [ ] Redis-backed task queue (BullMQ)
- [ ] Admin panel to view sync logs
- [ ] Swagger API Docs
- [ ] Dynamic product onboarding endpoint
- [ ] Pause/resume toggle for scheduled jobs

---

## 🧑‍💻 Author
Built by Rishal AT, Software Engineer.

---

