# 🌌 Sylphara — AI Chat Integration Platform

Sylphara is a lightweight AI-model backend built to let **any project** plug in and let its users have real conversations with an AI. Even though it starts small, the long-term vision is simple: **make Sylphara a drop-in AI conversation layer for any application.**

---

## 📌 Overview

Sylphara is a Node.js + Express + TypeScript backend powered by **Prisma (Postgres)**, **Redis**, and **Stripe**, offering role-based AI chat access, subscription-based usage limits, and full admin oversight.

The core idea: the better and more engaging a user's conversation is with the AI, the higher their satisfaction — so Sylphara is built around smooth, reliable, and scalable AI chat delivery.

---

---

## 📌 Links

BACKEND_REAL_API_LINK: https://slyphara-backend.vercel.app

---

## 👥 User Roles

Sylphara has **three roles**, each with a distinct purpose and access flow:

### 🛡️ Admin
- Can view **all users**
- Can view **payment analytics** and **payment history**
- Can **block / unblock** individual users
- Can view **all conversations & messages** (track-all-message)
- Can view **developer analytics**
- Grants or removes **project access** for developers based on their usage
- Reviews the **top-performing developer over the last 3 months** (by conversation volume/analytics) and grants that developer access to work on the Sylphara project itself

### 👨‍💻 Developer
- Gets tracked via **3-month analytics**
- Based on this analytics, an Admin can grant them access to the Sylphara project
- Consumes AI chat within their plan limits

### 🎓 Student
- Has subscription packages
- **15% discount** available at checkout if the student provides:
  - `student_id_card`
  - `institution_name`

---

## 💬 Chat Usage Limits

| Plan | Daily Chat Limit | Price |
|---|---|---|
| **Free** (Developer / Student) | 20 chats/day | Free |
| **Half-Yearly Subscription** | 100 chats/day | $150 (via Stripe) |

> Students additionally get a **15% discount** on the subscription if they verify their student ID card and institution name during payment.

---

## ⚙️ Tech Stack

- **Runtime:** Node.js (TypeScript, ESM)
- **Framework:** Express 5
- **Database:** PostgreSQL via Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)
- **Cache / OTP Store:** Redis (used for OTP verification system)
- **Auth:** JWT (`jsonwebtoken`), Google OAuth (`google-auth-library`)
- **Payments:** Stripe (`stripe`)
- **AI Layer:** OpenRouter SDK + OpenAI SDK
- **File Uploads:** Multer + Cloudinary
- **Email:** Nodemailer + EJS templates
- **PDF Generation:** PDFKit
- **Scheduling:** node-cron
- **Validation:** Zod
- **Linting/Formatting:** Biome
- **Dev Tooling:** tsx (watch mode), TypeScript

---

## 🧩 Key System Features

- ✅ **EJS Template System** — used for transactional emails (OTP, notifications, receipts)
- ✅ **Redis OTP System** — fast, expiring OTP verification for signup/login flows
- ✅ **Role-Based Access Control (RBAC)** — via `auth(UserRole.X)` middleware
- ✅ **Stripe Subscription Billing** — checkout session creation + payment verification
- ✅ **Google Sign-In** — one-tap login via Google client
- ✅ **Daily Chat Quotas** — enforced per role/plan (20 free / 100 paid)
- ✅ **Admin Analytics Dashboard (API)** — payments, developers, conversations

---

## 🗂️ Project Structure (Routing)

```
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/conversation", conversationRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/chat-with-ai", aiRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/admin", adminRouter);
```

---

## 🔐 Auth Routes — `/api/v1/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user (Zod validated) |
| POST | `/verified-user` | Verify OTP and finalize user creation |
| POST | `/login` | Login user (Zod validated) |
| POST | `/google` | Login/Signup via Google client |
| POST | `/refresh-token` | Issue a new access token |
| POST | `/forgot-password` | Trigger forgot-password flow |
| POST | `/reset-password` | Reset password (Zod validated) |

---

## 👤 Profile Routes — `/api/v1/profile`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/me` | Admin, Student, Developer | Get logged-in user's profile |
| PATCH | `/me` | Admin, Student, Developer | Update profile (supports `profileImage` upload) |

---

## 💬 Conversation Routes — `/api/v1/conversation`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/create-conversation` | Admin, Developer, Student | Start a new conversation |
| GET | `/all-conversations` | Admin, Developer, Student | Get all conversations for logged-in user |
| GET | `/search` | Admin, Developer, Student | Search conversations |
| GET | `/:id` | Admin, Developer, Student | Get a single conversation by ID |

---

## 📨 Message Routes — `/api/v1/message`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/:conversationId` | Developer, Student | Get all messages of a conversation |

---

## 🤖 AI Routes — `/api/v1/chat-with-ai`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/create-chat` | Admin, Developer, Student | Send a message to the AI and create a chat entry |

---

## 💳 Subscription Routes — `/api/v1/subscription`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/create-checkout-session` | Developer, Student | Create a Stripe checkout session |
| POST | `/verify-payment` | Developer, Student | Verify a completed Stripe payment |

---

## 🛡️ Admin Routes — `/api/v1/admin`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/all-users` | List all users |
| GET | `/analytics` | Payment analytics |
| GET | `/payment-history` | Payment history |
| PATCH | `/blocked-user` | Block a user |
| PATCH | `/unBlocked-user` | Unblock a user |
| GET | `/conversations` | All conversations with messages (admin view) |
| GET | `/developer-analytics` | Developer performance analytics (3-month window) |
| PATCH | `/grant-project-access` | Grant a developer access to the Sylphara project |
| PATCH | `/remove-project-access` | Remove a developer's project access |
| GET | `/project-developers` | List all developers with project access |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd project-ph-healthcare-system-backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the root with values such as:
```env
DATABASE_URL=
DIRECT_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
```

### 3. Run in Development
```bash
npm run dev
```

### 4. Build & Run in Production
```bash
npm run build
npm run start
```

### 5. Lint & Format
```bash
npm run lint:checked
npm run lint:fix
npm run format:checked
npm run format:fix
```

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `dev` | Run server in watch mode with `tsx` |
| `build` | Compile TypeScript to `dist/` |
| `start` | Run compiled production server |
| `lint:checked` | Check lint issues with Biome |
| `lint:fix` | Auto-fix lint issues |
| `format:checked` | Check formatting with Biome |
| `format:fix` | Auto-fix formatting |

---

## 📄 License
ISC