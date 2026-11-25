<div align="center">

# 🌸 Petalo — Marigold & Moss POS & Back Office

**A warm, editorial Point of Sale (POS) and multi-shop Back-Office platform built for boutique florists.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy_2.0-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ff7a59?style=flat-square)](./LICENSE)

</div>

---

## ✨ Overview

**Petalo** unifies counter checkout and back-office operations for **Marigold & Moss** across two shop locations (**Canal St** and **Market Hall**). Every sale, refund, order stage change, stem delivery, and till close updates live metrics across the entire workspace in real time.

### Highlights

- **13-View Unified Workspace** — Overview, Register, Orders, Sales, Customers, Insights, Payments, Stock, Team, Archive, Settings, Security, and Help.
- **Multi-Shop Context Switching** — Filter dashboards, orders, sales, tills, shifts, deliveries, and day closes by `All shops`, `Canal St`, or `Market Hall`.
- **Counter Register & Multi-Step Checkout** — Botanical product grid, custom amount ring-ups, customer attachment, Regular/Staff discounts, Card/Phone pay/Cash/Gift card flows, tip prompt, cash change calculator, and printable thermal-style receipts.
- **Orders Kanban & Timeline** — Drag-and-drop 5-stage fulfillment board (`New` → `Arranging` → `Ready` → `Out for delivery` → `Handed over`) with undoable toast transitions, 2-hour due timeline, and click-to-edit order details.
- **Perishable Stem & Vase-Life Tracking** — Freshness countdowns (`Soon` vs `Fresh`), par-level alerts, 1-click stock adjustments, and supplier delivery check-ins.
- **Global Omnibar (`⌘K` / `Ctrl+K`) & Theme Toggle** — Instant jump to pages, orders, products, and customers, plus persistent Light & Dark themes.

---

## 🧭 Workspace Modules

| Module | Key Capabilities |
| :--- | :--- |
| **Overview** | Hourly/weekly/monthly Takings comparison chart, 2×2 tinted bento KPIs, pick-up/delivery tracker, best sellers, payment mix sparklines, live till feed, use-first stems, and drawer cash. |
| **Register** | Till selector (with closed-till guard), category & SKU search, cart quantity/discount controls, tip prompt, cash tender validation, and `PAID` receipt modal. |
| **Orders** | Drag-and-drop Kanban board + tabular List view, 2-hour due timeline, florist bench load, and click-to-edit modal (stage, florist, payment, due time, notes). |
| **Sales** | Searchable transaction ledger, full line-item receipt inspection, and double-refund-protected refund processing. |
| **Customers** | Searchable CRM table with tier badges (`Regular`, `VIP`, `Corporate`), visit counts, lifetime spend, and add/edit modals. |
| **Insights** | Busy-hours footfall chart, category revenue breakdown, and Canal St vs Market Hall comparison. |
| **Payments** | Tender breakdown cards (Card, Phone pay, Cash, Gift card) and bank payout settlement schedule. |
| **Stock** | Incoming supplier delivery check-ins, vase-life countdowns, below-par filtering, SKU search, `-1` / `+5` adjustments, and `+ Add item` modal. |
| **Team** | 7-day drag-and-drop shift rota across both shops, `+ Add shift`, and click-to-edit shift hours/shop. |
| **Archive** | Till cash-drawer closing with variance calculation, historical day closes, and RFC-safe CSV sales export. |
| **Settings / Security / Help** | Shop identity, tax rate, auto-lock timeout, receipt footer, tip prompt toggle, staff till PIN directory, and keyboard shortcuts. |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** `>= 18`
- **Python** `>= 3.11`

### 1. Start the Backend (FastAPI + SQLite)

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

> On first startup, `backend/main.py` creates `petalo.db` and seeds realistic florist catalog, orders, sales, staff, shifts, and tills via `seed.py`.

### 2. Start the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Vite proxies all `/api/*` requests to `http://127.0.0.1:8000`.

### Production Build

```bash
cd frontend
npm run build
```

---

## 📁 Project Structure

```text
Sales&BackOffice-Petalo/
├── backend/
│   ├── main.py              # FastAPI app, REST endpoints & overview aggregation
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # SQLite engine & session management
│   ├── seed.py              # Initial Marigold & Moss seed data
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # Entry HTML + Urbanist Google Font
│   ├── vite.config.ts       # Vite config & /api proxy to :8000
│   └── src/
│       ├── App.tsx          # Root state, shop/range filters, modals & toast
│       ├── api.ts           # Typed fetch client for /api/*
│       ├── types.ts         # Shared TypeScript domain interfaces
│       ├── components/
│       │   └── Shell.tsx    # Floating dark sidebar, topbar, alerts, ⌘K omnibar
│       ├── pages/
│       │   ├── OverviewPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── SalesCustomersPages.tsx
│       │   ├── InsightsPaymentsPages.tsx
│       │   ├── StockTeamArchivePages.tsx
│       │   └── SupportPages.tsx
│       ├── styles/
│       │   ├── tokens.css   # Light & Dark CSS custom properties
│       │   └── app.css      # Layout, cards, tables, Kanban & responsive rules
│       └── ui/
│           ├── BotanicalIcons.tsx
│           └── format.ts
├── ARCHITECTURE.md          # Detailed system & frontend/backend architecture
├── SYSTEM_DESIGN.md         # ERD, API contract & state machines
├── GEMINI.md                # AI assistant project memory & conventions
└── LICENSE                  # MIT License
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/bootstrap?shop=all` | Full shop-scoped workspace payload |
| `GET` | `/api/overview?shop=all&range=today\|week\|month` | Takings series, KPIs & payment breakdown |
| `POST` | `/api/sales` | Atomic checkout (sale, items, stock, till, customer) |
| `POST` | `/api/sales/{id}/refund` | Refund sale & adjust cash till (double-refund guarded) |
| `POST` / `PATCH` | `/api/orders`, `/api/orders/{id}` | Create, move stage, or update order details |
| `POST` / `PATCH` | `/api/products`, `/api/products/{id}` | Create product or adjust stock/par/vase life |
| `POST` | `/api/deliveries/{id}/checkin` | Check in supplier delivery & restock stems |
| `POST` / `PATCH` | `/api/customers`, `/api/customers/{id}` | Create or update customer profile |
| `POST` / `PATCH` | `/api/shifts`, `/api/shifts/{id}` | Create or reschedule staff shifts |
| `POST` | `/api/tills/{id}/close` | Count drawer, close till & record `DayClose` |
| `PATCH` | `/api/settings` | Persist shop identity, tax, auto-lock & theme |

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.
