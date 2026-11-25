# Plan.md — Petalo POS & Back Office

## Goal
Deliver a cohesive, production-grade 13-page Point of Sale & Back-Office web application for a two-shop florist (**Marigold & Moss**: `Canal St` and `Market Hall`) with real-time SQLite persistence, editorial Light/Dark design parity, and complete repository documentation.

---

## Execution Phases

### Phase 1 — Backend Data Model & REST API
- **Objective**: Model all florist POS & back-office entities in SQLite via SQLAlchemy 2.0 and expose a clean FastAPI REST layer.
- **Deliverables**: `backend/models.py`, `backend/schemas.py`, `backend/database.py`, `backend/seed.py`, `backend/main.py`.
- **Key Decisions**:
  - Store all monetary values in integer **cents** (`*_cents`) to avoid floating-point rounding drift.
  - Perform checkout (`POST /api/sales`) atomically across `Sale`, `SaleItem`, `Product`, `Till`, and `Customer`.
  - Scope `/api/bootstrap` and `/api/overview` by `shop` (`all` | `canal` | `market`).

### Phase 2 — Design System & 13-Page Frontend
- **Objective**: Build a responsive React 18 + TypeScript SPA with custom CSS tokens, floating dark sidebar, and interactive workflows.
- **Deliverables**: `tokens.css`, `app.css`, `Shell.tsx`, `App.tsx`, and 7 modular page files under `frontend/src/pages/`.
- **Key Decisions**:
  - Keep the floating sidebar dark in both Light and Dark themes for strong visual anchoring.
  - Use `tabular-nums` (`.tabular`) across all prices, totals, receipts, and tables.
  - Support keyboard-first navigation (`⌘K` / `Ctrl+K` omnibar, `Esc` to dismiss modals) alongside touch/mobile drawer navigation.

### Phase 3 — UI Polish & End-to-End Functional Hardening
- **Objective**: Audit every page, card, spacing rule, and interactive flow to eliminate hardcoded placeholders, layout overflows, and missing CRUD actions.
- **Key Fixes**:
  - Unified card/table/input spacing and responsive breakpoints (`<= 1180px`, `<= 760px`).
  - Wired theme persistence, live alerts, closed-till guards, cash tender validation, receipt shop details, and edit modals for Orders, Customers, Stock, and Shifts.

### Phase 4 — Verification & Repository Documentation
- **Objective**: Validate builds and live endpoints, then publish clean documentation and project tracking to GitHub.
- **Deliverables**: `README.md`, `ARCHITECTURE.md`, `SYSTEM_DESIGN.md`, `GEMINI.md`, `Task.md`, `Plan.md`, `docs/PROJECT_LOG.md`, `LICENSE`, `.gitignore`.

---

## Verification Criteria
1. `python -m py_compile backend/main.py backend/schemas.py backend/models.py` exits `0`.
2. `npm.cmd --prefix frontend run build` (`tsc && vite build`) exits `0`.
3. Live servers (`127.0.0.1:8000` and `localhost:5173`) serve `/api/health` (`ok`) and shop-filtered `/api/bootstrap` payloads.

---

## Future Roadmap (Optional Extensions)
- **Authentication & PIN Lock**: Enforce staff till PIN entry on register switch and auto-lock timeout.
- **Automated Tests**: Add `pytest` API integration tests and Playwright/Vitest UI smoke tests.
- **Real-Time Multi-Till Sync**: Add WebSocket or SSE broadcast for multi-register environments.
