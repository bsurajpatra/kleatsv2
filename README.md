# Kleats 

Campus food, reimagined. Pre-order, skip the queue, and enjoy a modern PWA-like experience built with Next.js 15, React 18, Tailwind, and shadcn/ui.

## ✨ Features
- Lightning-fast Next.js App Router with client/server components
- Beautiful, responsive UI with Tailwind CSS + shadcn/ui
- Dark mode with `next-themes`
- Canteen discovery, categories, and search UX
- Cart and orders flow (frontend mocks + API-ready)
- Polished mobile experience with bottom navigation

## 🗂️ Project Structure
```
app/
  page.tsx                 # Home
  canteens/                # Explore canteens
  canteen/[slug]/          # Canteen details
  category/[slug]/         # Category listing
  search/                  # Search page
  orders/                  # Orders
  privacy-policy/          # Privacy Policy
  refund-policy/           # Refund & Cancellation Policy
  terms/                   # Terms & Conditions
components/                # UI and reusable components
hooks/                     # Client hooks (cart, auth, etc.)
lib/                       # API client, utils
services/                  # Service layer (mock + API-ready)
```

## 🚀 Getting Started

Prerequisites:
- Node.js 18+
- pnpm or npm (project includes a pnpm-lock.yaml)

Install deps and start dev server:

```powershell
# using pnpm (recommended)
pnpm install; pnpm dev

# or using npm
npm install; npm run dev
```

The dev server will start on http://localhost:3000 (or the next available port, e.g., 3001).

## 🔌 Environment

Create a `.env.local` if you plan to use a backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Note: Some routes use mock endpoints under `app/api/explore/*` for local development.

## 🧱 Tech Stack
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS + tailwind-merge + tailwindcss-animate
- shadcn/ui (Radix UI under the hood)
- framer-motion, lucide-react

## 🧭 Notable Pages
- Home: curated categories, popular items, offers
- Canteens: list + open-hours awareness
- Canteen Details: menu, categories, and info
- Search: filters, sorting, and improved relevance
- Legal: Terms, Refund & Cancellation, Privacy

## 🧪 Development Notes
- ESLint/TS errors are ignored during build for velocity (see `next.config.mjs`).
- Image optimization disabled for simplicity in dev (`images.unoptimized`).
- Service layer (`services/canteen-service.ts`) ships with mock data and is API-ready.

## 🤝 Contributing
Pull requests welcome! If you’d like to contribute content or canteen data, open an issue or reach out.

## 📄 License
Copyright © Equitech Lab Private Limited. All rights reserved.
