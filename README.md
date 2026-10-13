# KurtiKatha (কুর্টিকথা) — Production E-Commerce Platform

[![CI Pipeline](https://github.com/kurtikatha/kurtikatha/actions/workflows/ci.yml/badge.svg)](https://github.com/kurtikatha/kurtikatha/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)

**KurtiKatha** (logo wordmark: *"Kurti"* in Latin + *"কথা"* in Bengali script) is a production-ready, mobile-first e-commerce web platform for women's ethnic fashion, specializing in handcrafted breathable cotton kurtis, daily wear nighties, and festive sets priced affordably in Indian Rupees (₹ / INR).

---

## 🎨 Brand Identity & Design System

- **Signboard Crimson (`#D62828`)**: Primary brand shade derived from the Kolkata shop signboard.
- **Warm Gold (`#E9C46A`)**: Accent for festive highlights, sale ribbons, and primary CTA accents.
- **Cream Canvas (`#FFFDF9` / `#FAF6ED`)**: Warm, friendly, authentic ethnic boutique backdrop.
- **Charcoal Ink (`#1E1E24`)**: High-contrast typography optimized for Indian sunlight readability.
- **Bilingual Typography**: Clean Latin sans (**Poppins**) paired with Bengali script (**Baloo Da 2** / **Noto Sans Bengali**).
- **Direct Shop Helpline**: Editable contact phone `+91 86974 49885` and floating WhatsApp click-to-chat button.

---

## 📱 Mobile-First Architecture (360px – 390px Native)

Designed from the ground up for phone screens first:
- **Zero Horizontal Scrolling**: Strictly bounded fluid typography and adaptive flex layouts.
- **Touch-Friendly Targets**: All buttons, pills, quantity steppers, and tabs are $\ge 44\text{px}$.
- **Bottom Navigation Bar**: 5 key customer tabs (`Home`, `Shop`, `Wishlist`, `Cart`, `Account`).
- **Sticky Action Bar**: Fixed bottom bar on Product Detail Pages (`Add to Bag` + `Buy Now`).
- **Slide-in Cart Drawer**: Seamless slide-in drawer with instant quantity controls and pricing breakdown.
- **Bottom-Sheet Filters**: Mobile catalog filtering with instant active filter badges.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Core**: React 18, Vite 5, React Router v6
- **Styling**: Tailwind CSS, Lucide React Icons
- **State & Data**: Zustand (persistent cart & UI state), TanStack Query (server state & caching)
- **Forms & Validation**: React Hook Form, Zod
- **SEO & Social**: `react-helmet-async`, OpenGraph, Twitter Cards, `schema.org/Product` JSON-LD

### Backend (`/server`)
- **Runtime**: Node.js 20, Express
- **Database**: MongoDB Atlas via Mongoose
- **Security**: JWT in `httpOnly` secure cookies, bcrypt, Helmet, CORS allowlist, rate limiting, `express-mongo-sanitize`
- **Payments**: Razorpay Official Node SDK (Paise calculation, zero-trust backend price computation, timing-safe HMAC-SHA256 signature verification, raw body idempotent webhooks)
- **Storage & Communications**: Cloudinary (multi-image upload), Nodemailer (HTML order confirmations)

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js 20+ and npm 10+
- MongoDB Atlas cluster URI (or local MongoDB running on `mongodb://127.0.0.1:27017/kurtikatha`)
- Razorpay account (Test keys)

### 2. Clone and Install
```bash
git clone https://github.com/kurtikatha/kurtikatha.git
cd KurtiKatha
npm install
```

### 3. Environment Variables

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/kurtikatha?retryWrites=true&w=majority
JWT_SECRET=kurtikatha_dev_jwt_secret_change_in_production_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Razorpay Test Keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Cloudinary (Optional for dev)
CLOUDINARY_CLOUD_NAME=placeholder
CLOUDINARY_API_KEY=placeholder
CLOUDINARY_API_SECRET=placeholder

# Email (Mock mode fallback included)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@kurtikatha.com
SMTP_PASS=placeholder
EMAIL_FROM=KurtiKatha <orders@kurtikatha.com>
```

Create `client/.env` (optional for local development, Vite proxies `/api` to localhost:5000 by default):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Seed Database
Seeds 1 store admin, 4 categories, 24 ethnic kurtis and nighties with variant matrices, store settings, and discount coupons:
```bash
npm run seed
```

**Default Admin Credentials**:
- **Email**: `admin@kurtikatha.com`
- **Password**: `Admin@KurtiKatha2026`

### 5. Run Development Servers
```bash
npm run dev
```
- Storefront: `http://localhost:5173`
- Admin Operations Portal: `http://localhost:5173/admin`
- Backend API: `http://localhost:5000`

---

## 💳 Razorpay Integration & Live Key Switch

KurtiKatha implements a **zero-trust pricing model**:
1. Client sends only product IDs, variant sizes, and coupon codes.
2. Server recalculates all prices directly from the MongoDB database.
3. Razorpay order is initialized in paise with timing-safe HMAC signature verification (`crypto.timingSafeEqual`).
4. Webhooks parse raw request buffers and process `payment.captured` idempotently.

### Switching from Test Mode to Live Keys in Production:
1. Complete company KYC in your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle the switch at top right from **Test Mode** to **Live Mode**.
3. Navigate to **Settings > API Keys** and click **Generate Live Key**.
4. Copy `Key Id` (`rzp_live_...`) and `Key Secret`.
5. Update your production environment variables (e.g. on Render):
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=your_live_secret`
6. In **Razorpay Dashboard > Settings > Webhooks**:
   - **Webhook URL**: `https://your-api.onrender.com/api/payments/webhook`
   - **Secret**: Enter your `RAZORPAY_WEBHOOK_SECRET`
   - **Active Events**: Check `payment.captured`, `payment.failed`, `refund.processed`.
7. **No code modification required** — the app immediately transitions to live payments!

---

## 👩‍💼 Admin Operations Portal (`/admin`)

The admin portal is role-protected via secure JWT and responsive for mobile management:

- **Dashboard (`/admin`)**:
  - Live Total Revenue (₹) from verified orders.
  - Total Order Volume and Pending Fulfillment count.
  - Low Stock Inventory alerts (auto-flags variants with $\le 5$ items).
  - Recent customer orders table.
- **Orders (`/admin/orders`)**:
  - Step-by-step delivery workflow: `Placed` $\rightarrow$ `Confirmed` $\rightarrow$ `Packed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
  - Captures courier name (Delhivery, BlueDart, DTDC, India Post) and tracking number when dispatched.
  - Thermal packing slip printable invoice format.
- **Products (`/admin/products`)**:
  - Catalog overview across all 24 styles.
  - "Add New Product" modal with size $\times$ color variant stock allocations.
  - Delete / Edit actions with instant cache invalidation.
- **Store Settings (`/admin/settings`)**:
  - Edit shop phone (`+91 86974 49885`) and WhatsApp number.
  - Edit delivery charge (₹69) and free delivery threshold (₹999).
  - One-click Cash on Delivery (COD) enable/disable toggle.
  - Marquee announcement banner text editor.

---

## 🧪 Testing Suite

### Run Backend Unit & Security Tests (Jest)
Validates zero-trust price computation, timing-safe signatures, and webhook idempotency:
```bash
npm run test:server
```

### Run Mobile E-Commerce Smoke Test (Playwright)
Executes the full browse $\rightarrow$ PDP $\rightarrow$ cart $\rightarrow$ checkout $\rightarrow$ order confirmation flow at 390px viewport:
```bash
npm run test:e2e
```

---

## 🌐 Production Deployment

### Backend (Render)
1. Fork or push repository to GitHub.
2. In Render, select **New > Blueprint** and link the repository (uses `server/render.yaml`).
3. Add environment secrets:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Random 64-character secret.
   - `CLIENT_URL`: `https://your-app.vercel.app`.
   - `RAZORPAY_KEY_ID`: `rzp_test_...` or `rzp_live_...`.
   - `RAZORPAY_KEY_SECRET`: Razorpay secret.
4. Render deploys Node 20 web service with health monitoring at `/api/health`.

### Frontend (Vercel)
1. In Vercel, select **Add New Project** and choose the `KurtiKatha` repository.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-api.onrender.com`
5. Deploy. `vercel.json` automatically handles SPA routing and asset caching.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
KurtiKatha (কুর্টিকথা) © 2026. Handcrafted with love in Kolkata, India.
