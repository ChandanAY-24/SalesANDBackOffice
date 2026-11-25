# Task.md — Petalo POS & Back Office

## 1. Backend & Persistence (`backend/`)
- [x] Define 12 SQLAlchemy ORM models (`Shop`, `Staff`, `Product`, `Customer`, `Order`, `Till`, `Sale`, `SaleItem`, `Shift`, `DeliveryCheckIn`, `DayClose`, `AppSettings`)
- [x] Define Pydantic v2 request/update schemas in `schemas.py`
- [x] Implement idempotent seed data for `Canal St` and `Market Hall` in `seed.py`
- [x] Implement `/api/bootstrap` with shop-scoped filtering (`all`, `canal`, `market`)
- [x] Implement `/api/overview` dynamic aggregation for `today`, `week`, and `month` ranges + shop-scaled payment breakdown
- [x] Implement atomic checkout (`POST /api/sales`) updating `Sale`, `SaleItem`, `Product.stock_qty`, `Till.expected_cash_cents`, and `Customer` stats
- [x] Implement double-refund guard on `POST /api/sales/{id}/refund`
- [x] Implement closed-till guard and accurate `DayClose` recording on `POST /api/tills/{id}/close`
- [x] Implement CRUD endpoints for Orders, Products, Deliveries, Customers, Shifts, and Settings

## 2. Design System & Layout (`frontend/src/styles/`)
- [x] Configure `Urbanist` font, `14px` base scale, `.tabular` numeric alignment, and `:focus-visible` outlines
- [x] Define Light and Dark theme tokens (`tokens.css`) including `--bento-pill-bg`
- [x] Align `.topbar` and `.page-scroll` horizontal padding (`26px` desktop, `16px` mobile)
- [x] Standardize `.card`, `.bento-card`, `.cart-panel`, `.product-tile`, `.icon-pill-soft`, `.search-field`, `.input-field`, and `.data-table`
- [x] Add responsive breakpoints for `<= 1180px` and `<= 760px` (mobile drawer & stacked grids)

## 3. Frontend Features & Pages (`frontend/src/`)
- [x] **Shell**: Collapsible floating dark sidebar, mobile drawer, live alerts popover, `⌘K` omnibar (pages, orders, products, customers), shop selector, persisted theme toggle
- [x] **Overview**: Interactive Takings bar chart with hover tooltips, dynamic 2×2 bento cards, pick-ups/deliveries progress, best sellers toggle, payment sparklines, till feed, use-first stems, drawer cash
- [x] **Register**: Till selector with closed-till guard, category & SKU search, custom amount modal, customer attachment, discounts, multi-step checkout (Card, Phone pay, Cash with validation, Gift card), printable `PAID` receipt
- [x] **Orders**: 5-column drag-and-drop Kanban board with Undo toast, 2-hour due timeline, bench load bars, List view, and click-to-edit order modal
- [x] **Sales & Customers**: Searchable sales ledger, full line-item receipt modal with refund, customer search, and add/edit customer modal
- [x] **Insights & Payments**: Busy-hours chart, category revenue mix, shop comparison, tender KPI cards, and payout schedule
- [x] **Stock, Team & Archive**: Delivery check-in, vase-life badges, stock search/adjust/`+ Add item`, 7-day drag-and-drop rota with `+ Add shift`/edit modal, till close, and CSV export
- [x] **Settings, Security & Help**: Shop identity, tax rate, auto-lock timeout, receipt footer, tip prompt toggle, till PIN table, shortcuts & checklist

## 4. Verification, Docs & Release
- [x] Verify backend Python compilation and live API health
- [x] Verify frontend TypeScript check (`tsc`) and Vite production build
- [x] Create `README.md`, `ARCHITECTURE.md`, `LICENSE` (MIT), `GEMINI.md`, `Task.md`, `Plan.md`, and `docs/PROJECT_LOG.md`
- [x] Push repository to GitHub (`ChandanAY-24/SalesANDBackOffice`)
