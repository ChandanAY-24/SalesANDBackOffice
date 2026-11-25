import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BarChart3,
  Bell,
  Box,
  Calculator,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Flower2,
  HelpCircle,
  Home,
  Menu,
  Moon,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Users,
  UserCheck,
} from 'lucide-react';
import { BootstrapPayload, NavRoute } from '../types';

interface ShellProps {
  route: NavRoute;
  onNavigate: (r: NavRoute) => void;
  shopFilter: string;
  onShopFilter: (s: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  data: BootstrapPayload;
  onOpenNewOrder: () => void;
  children: React.ReactNode;
}

const ROUTE_LABELS: Record<NavRoute, string> = {
  overview: 'Overview',
  register: 'Register',
  orders: 'Orders',
  sales: 'Sales',
  customers: 'Customers',
  insights: 'Insights',
  payments: 'Payments',
  stock: 'Stock',
  team: 'Team',
  archive: 'Archive',
  settings: 'Settings',
  security: 'Security',
  help: 'Help',
};

export const Shell: React.FC<ShellProps> = ({
  route,
  onNavigate,
  shopFilter,
  onShopFilter,
  theme,
  onToggleTheme,
  data,
  onOpenNewOrder,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const openOrdersCount = data.orders.filter((o) => o.stage !== 'Handed over').length;
  const lowStockCount = data.products.filter((p) => p.stock_qty < p.par_level).length;

  const liveAlerts = useMemo(() => {
    const alerts: { text: string; route: NavRoute }[] = [];
    const soonStems = data.products.filter((p) => p.vase_life_days !== null && p.vase_life_days <= 2);
    if (soonStems.length > 0) {
      alerts.push({
        text: `${soonStems.map((s) => s.name).slice(0, 2).join(' & ')} within 2 days vase life`,
        route: 'stock',
      });
    }
    const nextOrder = data.orders
      .filter((o) => o.due_bucket === 'Today' && o.stage !== 'Handed over')
      .sort((a, b) => a.due_time.localeCompare(b.due_time))[0];
    if (nextOrder) {
      alerts.push({
        text: `${nextOrder.title} due at ${nextOrder.due_time} (${nextOrder.shop_id === 'canal' ? 'Canal St' : 'Market Hall'})`,
        route: 'orders',
      });
    }
    const pendingDel = data.deliveries.find((d) => d.status !== 'Checked in');
    if (pendingDel) {
      alerts.push({
        text: `${pendingDel.supplier} delivery ${pendingDel.eta}`,
        route: 'stock',
      });
    }
    return alerts;
  }, [data.products, data.orders, data.deliveries]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cmdResults = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    const pages = (Object.keys(ROUTE_LABELS) as NavRoute[])
      .filter((k) => !q || ROUTE_LABELS[k].toLowerCase().includes(q))
      .slice(0, 5)
      .map((k) => ({ kind: 'Page', label: ROUTE_LABELS[k], sub: `Go to ${ROUTE_LABELS[k]}`, action: () => onNavigate(k) }));
    if (!q) return pages;
    const orders = data.orders
      .filter((o) => o.title.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((o) => ({ kind: 'Order', label: o.title, sub: `${o.customer_name} · ${o.stage}`, action: () => onNavigate('orders') }));
    const products = data.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ kind: 'Product', label: p.name, sub: `${p.category} · ${p.stock_qty} left`, action: () => onNavigate('register') }));
    const customers = data.customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ kind: 'Customer', label: c.name, sub: `${c.tier} · ${c.visits_count} visits`, action: () => onNavigate('customers') }));
    return [...pages, ...orders, ...products, ...customers];
  }, [cmdQuery, data.orders, data.products, data.customers, onNavigate]);

  const shopItems: { id: NavRoute; label: string; icon: React.ReactNode; badge?: number; warn?: boolean; chevron?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={16} /> },
    { id: 'register', label: 'Register', icon: <Calculator size={16} /> },
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={16} />, badge: openOrdersCount },
    { id: 'sales', label: 'Sales', icon: <Receipt size={16} />, chevron: true },
    { id: 'customers', label: 'Customers', icon: <UserCheck size={16} /> },
    { id: 'insights', label: 'Insights', icon: <BarChart3 size={16} />, chevron: true },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, chevron: true },
    { id: 'stock', label: 'Stock', icon: <Box size={16} />, badge: lowStockCount || 16, warn: true, chevron: true },
    { id: 'team', label: 'Team', icon: <Users size={16} />, chevron: true },
    { id: 'archive', label: 'Archive', icon: <Archive size={16} />, chevron: true },
  ];

  const supportItems: { id: NavRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={16} /> },
  ];

  const isSupport = route === 'settings' || route === 'security' || route === 'help';

  return (
    <div className="app-shell">
      {mobileOpen && <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar__brand">
          <div className="brand-lockup">
            <div className="brand-icon">
              <Flower2 size={18} />
            </div>
            {!collapsed && (
              <div>
                <div className="brand-title">Petalo</div>
                <div className="brand-sub">{data.settings.business_name || 'Marigold & Moss'}</div>
              </div>
            )}
          </div>
          <button
            className="icon-btn"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <nav className="sidebar__nav">
          {!collapsed && <div className="nav-section-label">Shop</div>}
          {shopItems.map((it) => (
            <button
              key={it.id}
              className={`nav-item ${route === it.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(it.id);
                setMobileOpen(false);
              }}
              title={it.label}
            >
              {it.icon}
              {!collapsed && <span className="nav-item__label">{it.label}</span>}
              {!collapsed && it.badge !== undefined && (
                <span className={`nav-badge ${it.warn ? 'warn' : ''}`}>{it.badge}</span>
              )}
              {!collapsed && it.chevron && <ChevronDown size={13} style={{ opacity: 0.55 }} />}
            </button>
          ))}

          {!collapsed && <div className="nav-section-label" style={{ marginTop: 8 }}>Support</div>}
          {supportItems.map((it) => (
            <button
              key={it.id}
              className={`nav-item ${route === it.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(it.id);
                setMobileOpen(false);
              }}
              title={it.label}
            >
              {it.icon}
              {!collapsed && <span className="nav-item__label">{it.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="avatar-circle">IO</div>
          {!collapsed && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Ines Okafor</div>
                <div style={{ fontSize: 11, color: 'var(--side-muted)' }}>Shop manager</div>
              </div>
              <MoreVertical size={14} color="var(--side-muted)" />
            </>
          )}
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn mobile-menu-btn" onClick={() => setMobileOpen((v) => !v)} title="Menu">
              <Menu size={17} />
            </button>
            <div className="breadcrumb">
              <span>{isSupport ? 'Support' : 'Shop'}</span>
              <ChevronRight size={13} />
              <strong>{ROUTE_LABELS[route]}</strong>
            </div>
          </div>

          <button className="omnibar-btn" onClick={() => setCmdOpen(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} />
              <span>Search orders, stems, people...</span>
            </span>
            <span className="kbd-pill">⌘K</span>
          </button>

          <div className="topbar__actions">
            <div className="shop-select-wrap">
              <Store size={14} />
              <select
                value={shopFilter}
                onChange={(e) => onShopFilter(e.target.value)}
                aria-label="Shop location"
              >
                <option value="all">Both shops</option>
                <option value="canal">Canal St</option>
                <option value="market">Market Hall</option>
              </select>
            </div>

            <div className="status-pill tabular">
              <span className="dot-green" />
              <span>Fri 23 Oct · 14:40</span>
            </div>

            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setNotifOpen((v) => !v)} title="Notifications">
                <Bell size={16} />
                {liveAlerts.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: 'var(--accent-coral)',
                      color: 'var(--accent-coral-ink)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {liveAlerts.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 38,
                    width: 300,
                    zIndex: 50,
                    boxShadow: 'var(--shadow-modal)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Alerts ({liveAlerts.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    {liveAlerts.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)' }}>All caught up — no active alerts.</div>
                    ) : (
                      liveAlerts.map((al, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onNavigate(al.route);
                            setNotifOpen(false);
                          }}
                          style={{
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            padding: '5px 6px',
                            borderRadius: 8,
                            color: 'var(--text-secondary)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          • {al.text}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn" onClick={onToggleTheme} title="Toggle light/dark mode">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="btn btn-primary" onClick={onOpenNewOrder}>
              <Plus size={15} />
              <span>New</span>
            </button>
          </div>
        </header>

        <main className="page-scroll">{children}</main>
      </div>

      {cmdOpen && (
        <div className="modal-backdrop" onClick={() => setCmdOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Jump to page, order, stem, or customer..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14 }}
              />
              <span className="kbd-pill">Esc</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cmdResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    r.action();
                    setCmdOpen(false);
                    setCmdQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 10px',
                    borderRadius: 9,
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.sub}</div>
                  </div>
                  <span className="pill">{r.kind}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
