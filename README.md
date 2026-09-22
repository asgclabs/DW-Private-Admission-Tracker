# CBSE Private Students Guide — Doon Winner Academy

A Next.js application for CBSE private candidates (Compartment, Improvement and
Essential Repeat), modelled on the existing NIOS admission tracker at
[admissions.doonwinner.in](https://admissions.doonwinner.in/).

Frontend, API and database access all live in this one Next.js project — there is no
separate backend.

**Courses are data, not code.** A super-admin creates a course in the dashboard, ticks
which fields its application form should collect, turns it on, and it is live on the
website immediately — no deploy, no code change.

## Stack

- **Next.js 16** (App Router, Turbopack) — pages and API routes in one project
- **MongoDB** via the official `mongodb` Node driver — **no ORM**
- **Tailwind CSS v4**
- **Razorpay Orders API** with server-side signature verification
- **jose** + **bcryptjs** for admin sessions and password hashing

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your MongoDB connection string (Atlas `mongodb+srv://…`) |
| `MONGODB_DB` | Database name, defaults to `dw_private` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (this one reaches the browser) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used **once** to create the first super-admin |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your domain in production |

> **A replica set is required.** The app writes an application and its first status
> event together. MongoDB Atlas is a replica set out of the box, so nothing to do
> there. A plain local `mongod` is **not** — see "Running MongoDB locally" below.

### 3. Create indexes, the first super-admin, and the three starter courses

```bash
npm run db:seed
```

Safe to re-run: it never resets an existing password and never overwrites a course you
have edited. After the first run, manage admins at `/admin/users` — `ADMIN_EMAIL` and
`ADMIN_PASSWORD` are only a bootstrap.

### 4. Run

```bash
npm run dev
```

### Running MongoDB locally

Atlas needs none of this. For a local database, MongoDB must run as a **single-node
replica set** — a plain standalone `mongod` cannot do the writes this app makes.

**Option A — Docker**

```bash
docker run -d --name dw-mongo -p 27018:27017 mongo:7 --replSet rs0 --bind_ip_all
```

**Option B — MongoDB Community Server** (`winget install MongoDB.Server`)

The installer registers a Windows service on port 27017 as a *standalone*, which this
app cannot use. Run a second instance with its own data directory instead — this needs
no administrator rights:

```bash
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --port 27018 --dbpath "C:\Users\<you>\AppData\Local\dw-mongo\data" --replSet rs0 --bind_ip 127.0.0.1
```

Either way, initiate the replica set once:

```bash
npm run mongo:init
```

and set:

```
DATABASE_URL="mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true"
```

To use the Windows service on 27017 permanently instead, open PowerShell **as
Administrator**, add a `replication:` / `replSetName: rs0` block to
`C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg`, then `Restart-Service MongoDB`
and run `npm run mongo:init mongodb://127.0.0.1:27017/?directConnection=true`.

## Collections

| Collection | Notes |
|---|---|
| `courses` | One document per program, including its form configuration |
| `applications` | One per student. Status history is **embedded** as an `events` array |
| `adminUsers` | bcrypt password hashes, `SUPER_ADMIN` / `ADMIN` role |
| `notifications` | Public announcements |

Status events are embedded rather than stored in their own collection: they are few,
always read with the application, and never queried on their own.

### Indexes

Created by `npm run db:seed` and by `ensureIndexes()` in `src/lib/mongodb.ts`:

- `adminUsers`: unique `email`, `role`
- `courses`: unique `slug`, `{ isActive, sortOrder }`
- `applications`: unique `referenceNo`, **unique + sparse** `razorpayOrderId`,
  `courseSlug`, `status`, `phone`, `createdAt`
- `notifications`: `{ isActive, createdAt }`

The `razorpayOrderId` index **must stay sparse**. An application has no order id until
checkout starts, and a non-sparse unique index would treat every one of those as the
same missing value and reject the second pending application.

## Roles

| | Super-admin | Admin |
|---|---|---|
| Applications, status updates, CSV export | ✅ | ✅ |
| Notifications | ✅ | ✅ |
| Create / edit / publish courses and set fees | ✅ | ❌ |
| Add, promote, deactivate admin users | ✅ | ❌ |

Enforced in three places: the API route, the page (redirects to `/admin`), and the nav.
The role is re-read from the database on every request, so deactivating or demoting
someone takes effect immediately rather than when their 8-hour token expires. The last
active super-admin cannot be demoted, deactivated or deleted.

## Creating a course

`/admin/courses` → **New course**. You set:

- **Details** — name, short name, URL slug, one-line description, fee, who it is for,
  card colour, display order
- **Selling points** — what students get, who can enroll, why they pick it (reorderable)
- **Form fields** — tick which of the 18 catalog fields the form collects (roll number,
  subject combination, category, subject picker, address, school details…) and mark which
  of those are compulsory
- **Extra questions** — anything not in the catalog: short text, long text, dropdown,
  date, number or yes/no checkbox, each optionally required
- **Publishing** — "Live on the website" and "Most popular"

Turning a course **off** removes it from the home page, 404s its apply page, and rejects
any submission to it — existing applications are untouched.

A course with applications cannot be deleted, only turned off. MongoDB has no foreign
keys, so that guard lives in the DELETE route (`src/app/api/admin/courses/[id]/route.ts`)
— it counts applications before deleting. Keep it there.

### Catalog fields vs extra questions

Catalog fields map to real top-level document fields, so they are filterable, sortable
and get their own CSV column. Extra questions are stored under `customAnswers` and appear
in the admin record and in a single "Extra Answers" CSV column. Prefer a catalog field
for anything more than one course will ask; add one in `src/lib/field-catalog.ts`.

## Payment flow

1. Student submits a form → document saved with status `PENDING_PAYMENT` and a reference
   number issued immediately (`DW` + slug initials + year + 6 characters, e.g.
   `DWFI-26-4F8K2Q`).
2. The server creates a Razorpay **order** using the fee **from the course document** —
   never from the browser — and returns it.
3. Razorpay Checkout opens; on success the browser posts the signature to
   `/api/payment/verify`, which recomputes the HMAC server-side before marking it paid.
4. `/api/razorpay/webhook` is the safety net for payments the browser never confirmed.
   Point a Razorpay webhook at `https://your-domain/api/razorpay/webhook` for
   `payment.captured` and `payment.failed`.

Both the verify route and the webhook use **conditional updates** (`paymentStatus:
"PENDING"` in the filter), so whichever arrives second is a no-op rather than a duplicate
event.

Each application stores a snapshot of the course name, slug and fee, so editing a course
later never rewrites what a student actually signed up and paid for.

## Routes

**Public**

- `/` — the guide page: category explainer, live courses, comparison, process, FAQ
- `/programs/[slug]` — full detail page per course
- `/apply/[slug]` — the application form, built from that course's configuration
- `/success?ref=…` — confirmation with the reference number
- `/track` — status lookup (reference number **and** registered mobile number)
- `/notifications`, `/about`, `/contact`, `/terms`, `/privacy`, `/shipping`, `/refund`

**Admin** (`/admin`, protected by `src/proxy.ts`)

- `/admin` — applications with search, filters, stats and CSV export
- `/admin/applications/[id]` — full record, status updates, activity log
- `/admin/notifications` — publish and remove announcements
- `/admin/courses`, `/admin/courses/new`, `/admin/courses/[id]` — super-admin only
- `/admin/users` — super-admin only

## Notes on data handling

- The application form's validation schema is built **server-side from the course
  document**, so a tampered payload cannot enable a field the course does not ask for,
  and the fee always comes from the database.
- The tracking page requires **both** the reference number and the registered mobile
  number, and returns only display fields — never the address, email or payment IDs.
  The phone is part of the query, so a wrong number is indistinguishable from an unknown
  reference.
- Admin search input is regex-escaped before it reaches MongoDB, so a stray `(` in the
  search box cannot throw or match unintended documents.
- CSV export escapes leading `=`, `+`, `-` and `@` to prevent formula injection in Excel.

## A note on file layout

`src/lib/courses.ts` (database) and `src/lib/course-view.ts` (types, accent classes) are
deliberately separate. Client components import from `course-view`; importing them from
`courses` would pull the MongoDB driver into the browser bundle and break the build.

## Deployment

Works on Vercel as-is. Set every variable from `.env.example` in the project settings,
point `NEXT_PUBLIC_SITE_URL` at your domain, allow Vercel's IPs in Atlas Network Access,
and register the Razorpay webhook. Run `npm run db:seed` once against the production
database to create the indexes and the first super-admin.
# DW-Private-Admission-Tracker
