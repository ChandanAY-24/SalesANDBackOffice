# GEMINI.md — Petalo Project Memory

## Project Identity
- **Name**: Petalo — Marigold & Moss POS & Back Office
- **Purpose**: Full-stack 13-page Point of Sale & Back-Office app for a two-shop florist (`Canal St` (`canal`) and `Market Hall` (`market`)).
- **Repo**: `https://github.com/ChandanAY-24/SalesANDBackOffice.git` (branch: `main`)

## Tech Stack
- **Frontend** (`frontend/`): React 18, TypeScript, Vite 5, `lucide-react`, plain CSS with custom properties (`src/styles/tokens.css`, `src/styles/app.css`).
- **Backend** (`backend/`): Python FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite (`backend/petalo.db`).

## Local Development Commands (Windows)
- **Backend**:
  - Venv exists at `backend/.venv`. Note: global `python` does NOT have `uvicorn` installed.
  - Run: `cd backend; .\.venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000 --reload`
- **Frontend**:
  - Note: PowerShell execution policy may block `npm.ps1`; use `npm.cmd` in scripts/commands.
  - Dev server: `npm.cmd --prefix frontend run dev` (proxies `/api` to `http://127.0.0.1:8000` via `vite.config.ts`).
  - Build/Typecheck: `npm.cmd --prefix frontend run build` (`tsc && vite build`).
- **Backend Syntax Check**:
  - `python -m py_compile backend/main.py backend/schemas.py backend/models.py`

## Architecture & Key Files
- `backend/main.py`: All FastAPI endpoints (`/api/health`, `/api/bootstrap?shop=`, `/api/overview?shop=&range=`, `/api/sales`, `/api/sales/{id}/refund`, `/api/orders`, `/api/products`, `/api/deliveries/{id}/checkin`, `/api/customers`, `/api/shifts`, `/api/tills/{id}/close`, `/api/day-closes`, `/api/settings`).
- `backend/models.py` & `backend/schemas.py`: 12 SQLAlchemy models & Pydantic schemas.
- `backend/seed.py`: Seeds initial Marigold & Moss data on first run.
- `frontend/src/App.tsx`: Root state (`route`, `shopFilter`, `rangeMode`, `theme`, `data`, `overview`, `toast`), New Order modal, and `refresh()`.
- `frontend/src/components/Shell.tsx`: Floating dark sidebar (always dark in both themes), mobile drawer, topbar, shop selector, live alerts popover, `⌘K`/`Ctrl+K` omnibar.
- `frontend/src/pages/`:
  - `OverviewPage.tsx`, `RegisterPage.tsx`, `OrdersPage.tsx`
  - `SalesCustomersPages.tsx` (`SalesPage`, `CustomersPage`)
  - `InsightsPaymentsPages.tsx` (`InsightsPage`, `PaymentsPage`)
  - `StockTeamArchivePages.tsx` (`StockPage`, `TeamPage`, `ArchivePage`)
  - `SupportPages.tsx` (`SettingsPage`, `SecurityPage`, `HelpPage`)

## Conventions & Guardrails
- **Money**: All monetary values are stored and passed in integer **cents** (`*_cents`), formatted via `formatMoney` / `formatMoneyWhole` in `frontend/src/ui/format.ts`.
- **Shop Filtering**: `/api/bootstrap?shop=` filters shop-scoped entities (`orders`, `sales`, `tills`, `shifts`, `deliveries`, `day_closes`) when `shop !== "all"`.
- **Styling**: Use `.card`, `.bento-card`, `.icon-pill-soft`, `.search-field`, `.input-field`, `.pill`, `.btn`, `.tabular`, and CSS tokens in `tokens.css`. Keep `.topbar` and `.page-scroll` horizontal padding aligned (`26px` desktop, `16px` mobile).
- **PowerShell**: Use `;` (not `&&`) in Windows PowerShell 5.1 commands.
