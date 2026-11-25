# Project Log & Verification Checklist — Petalo POS & Back Office

## Chronological Log

### 2026-11-25 — Phase 1: Core Application & Design System
- Built the **FastAPI + SQLite** backend (`backend/main.py`, `models.py`, `schemas.py`, `database.py`, `seed.py`) with 12 ORM models and initial Marigold & Moss seed data across `Canal St` and `Market Hall`.
- Built the **React 18 + TypeScript + Vite** frontend (`frontend/src/`) covering all 13 views: `Overview`, `Register`, `Orders`, `Sales`, `Customers`, `Insights`, `Payments`, `Stock`, `Team`, `Archive`, `Settings`, `Security`, and `Help`.
- Implemented the **Urbanist** typography scale, Light/Dark CSS custom-property tokens (`tokens.css`), floating dark sidebar (`Shell.tsx`), and botanical line-art icons (`BotanicalIcons.tsx`).

### 2026-11-25 — Phase 2: Design, Typography, Padding & Responsiveness Pass
- Standardized base typography (`14px` / `1.45`) and added `:focus-visible` accessibility rings in `tokens.css`.
- Aligned `.topbar` and `.page-scroll` horizontal padding (`26px` desktop, `16px` mobile).
- Unified `.card` (`20px 22px`), `.bento-card` (`16px 18px`), `.cart-panel`, `.product-tile`, and `.data-table` padding and spacing.
- Added `--bento-pill-bg` and `.icon-pill-soft` for crisp icon contrast in both Light and Dark themes.
- Replaced inline multi-column grids with responsive classes (`.orders-top-grid`, `.insights-top-grid`, `.shop-compare-grid`, `.payments-kpi-grid`, `.deliveries-grid`, `.help-grid`) and fixed mobile `margin-left` reset.

### 2026-11-25 — Phase 3: Full-Stack Functional Fixes
- **Backend (`backend/main.py`)**:
  - Filtered `/api/bootstrap?shop=` by `canal` / `market` for `orders`, `sales`, `tills`, `shifts`, `deliveries`, and `day_closes`.
  - Scaled `payments_breakdown` in `_compute_overview` by selected shop.
  - Added double-refund guard on `POST /api/sales/{id}/refund` and already-closed guard on `POST /api/tills/{id}/close`.
- **Frontend**:
  - Persisted theme toggles via `PATCH /api/settings` and synced initial theme from backend settings (`App.tsx`).
  - Added mobile navigation drawer, live alerts popover, and customer results in `⌘K` Omnibar (`Shell.tsx`).
  - Replaced hardcoded Overview bento subtitles, next payout, chart tooltip labels, and footer with live data (`OverviewPage.tsx`).
  - Synced `activeTillId` on shop switch, blocked charging on closed tills, validated cash tendered, adapted tap/redeem step by payment method, and rendered shop address & discount line on receipts (`RegisterPage.tsx`).
  - Added click-to-edit Order modal (`OrdersPage.tsx`), full receipt line-item breakdown (`SalesPage`), customer search & edit modal (`CustomersPage`), stock search & `+ Add item` modal (`StockPage`), `+ Add shift` & edit shift modal (`TeamPage`), CSV escaping (`ArchivePage`), and `auto_lock_minutes` (`SettingsPage`).

### 2026-11-25 — Phase 4: Verification, Documentation & GitHub Release
- Verified `python -m py_compile backend/main.py backend/schemas.py backend/models.py` (exit code `0`).
- Verified `npm.cmd --prefix frontend run build` (`tsc && vite build`, exit code `0`).
- Restarted backend (`127.0.0.1:8000`) and frontend (`localhost:5173`) and verified `/api/bootstrap?shop=canal` and `/api/health`.
- Added `.gitignore`, `README.md`, `ARCHITECTURE.md`, `LICENSE` (MIT), `GEMINI.md`, `Task.md`, `Plan.md`, and `docs/PROJECT_LOG.md`, and pushed to `https://github.com/ChandanAY-24/SalesANDBackOffice.git`.

---

## Final Verification Checklist

- [x] **Backend Syntax & Startup**: `py_compile` passes; FastAPI starts cleanly on `127.0.0.1:8000` with SQLite auto-seed.
- [x] **Frontend Typecheck & Build**: `tsc && vite build` passes with zero errors.
- [x] **Shop Filtering**: Topbar shop selector (`All`, `Canal St`, `Market Hall`) filters Overview KPIs, Orders, Sales, Tills, Shifts, Deliveries, and Day Closes.
- [x] **Register Checkout Flow**: Catalog search, category filters, custom amount, customer attach, discounts, Card/Phone/Cash/Gift card, tip prompt, cash change validation, and receipt print/email.
- [x] **Orders Kanban & List**: Drag-and-drop stage transitions with Undo toast + click-to-edit modal.
- [x] **Back-Office CRUD**: Refunds, Customer create/edit, Stock adjust/add/delivery check-in, Shift add/drag/edit, Till close & CSV export, Settings persistence.
- [x] **Responsive & Theme Parity**: Light/Dark theme persistence + desktop/tablet/mobile drawer layout.
- [x] **Repository Hygiene**: `.gitignore` excludes `node_modules/`, `dist/`, `.venv/`, `__pycache__/`, and `*.db`; docs and MIT license committed.
