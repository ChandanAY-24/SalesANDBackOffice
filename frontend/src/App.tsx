import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from './api';
import { Shell } from './components/Shell';
import { InsightsPage, PaymentsPage } from './pages/InsightsPaymentsPages';
import { OrdersPage } from './pages/OrdersPage';
import { OverviewPage } from './pages/OverviewPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomersPage, SalesPage } from './pages/SalesCustomersPages';
import { ArchivePage, StockPage, TeamPage } from './pages/StockTeamArchivePages';
import { HelpPage, SecurityPage, SettingsPage } from './pages/SupportPages';
import { BootstrapPayload, NavRoute, OverviewData } from './types';

export function App() {
  const [route, setRoute] = useState<NavRoute>('overview');
  const [shopFilter, setShopFilter] = useState('all');
  const [rangeMode, setRangeMode] = useState<'today' | 'week' | 'month'>('today');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  // New Order Form State
  const [ordTitle, setOrdTitle] = useState('');
  const [ordCust, setOrdCust] = useState('');
  const [ordShop, setOrdShop] = useState('canal');
  const [ordFulfill, setOrdFulfill] = useState('Collect');
  const [ordDue, setOrdDue] = useState('16:30');
  const [ordBucket, setOrdBucket] = useState<'Today' | 'Tomorrow' | 'This week'>('Today');
  const [ordStaff, setOrdStaff] = useState('st_jonah');
  const [ordPayStatus, setOrdPayStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [ordPrice, setOrdPrice] = useState('58');

  const showToast = useCallback((msg: string, undo?: () => void) => {
    setToast({ msg, undo });
    setTimeout(() => setToast((cur) => (cur?.msg === msg ? null : cur)), 4500);
  }, []);

  const refresh = useCallback(async () => {
    const [boot, ov] = await Promise.all([
      api.bootstrap(shopFilter),
      api.overview(shopFilter, rangeMode),
    ]);
    setData(boot);
    setOverview(ov);
  }, [shopFilter, rangeMode]);

  useEffect(() => {
    refresh().catch((err) => showToast(err instanceof Error ? err.message : 'Failed to load data'));
  }, [refresh, showToast]);

  useEffect(() => {
    if (data?.settings?.theme && data.settings.theme !== theme) {
      setTheme(data.settings.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.settings?.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      await api.updateSettings({ theme: next });
    } catch {
      // keep local theme even if offline
    }
  };

  const handleMoveOrder = async (orderId: string, newStage: string) => {
    if (!data) return;
    const prev = data.orders.find((o) => o.id === orderId);
    if (!prev || prev.stage === newStage) return;
    setData({
      ...data,
      orders: data.orders.map((o) => (o.id === orderId ? { ...o, stage: newStage } : o)),
    });
    try {
      await api.updateOrder(orderId, { stage: newStage });
      showToast(`${prev.title} → ${newStage}`, async () => {
        await api.updateOrder(orderId, { stage: prev.stage });
        await refresh();
      });
      await refresh();
    } catch (err) {
      await refresh();
      showToast(err instanceof Error ? err.message : 'Could not update order');
    }
  };

  const handleCreateOrder = async () => {
    if (!ordTitle.trim() || !ordCust.trim()) {
      showToast('Please enter an arrangement title and customer name');
      return;
    }
    try {
      const createdTitle = ordTitle.trim();
      await api.createOrder({
        title: createdTitle,
        customer_name: ordCust.trim(),
        shop_id: ordShop,
        fulfillment: ordFulfill,
        due_time: ordDue,
        due_bucket: ordBucket,
        payment_status: ordPayStatus,
        total_cents: Math.round(parseFloat(ordPrice || '58') * 100),
        assigned_staff_id: ordStaff,
      });
      setNewOrderOpen(false);
      setOrdTitle('');
      setOrdCust('');
      await refresh();
      showToast(`Order "${createdTitle}" created`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  if (!data || !overview) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading Petalo...
      </div>
    );
  }

  return (
    <>
      <Shell
        route={route}
        onNavigate={setRoute}
        shopFilter={shopFilter}
        onShopFilter={setShopFilter}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        data={data}
        onOpenNewOrder={() => setNewOrderOpen(true)}
      >
        {route === 'overview' && (
          <OverviewPage
            data={data}
            overview={overview}
            rangeMode={rangeMode}
            onChangeRange={setRangeMode}
            onNavigate={setRoute}
            onOpenNewOrder={() => setNewOrderOpen(true)}
          />
        )}
        {route === 'register' && (
          <RegisterPage data={data} onSaleCompleted={refresh} onToast={(m) => showToast(m)} />
        )}
        {route === 'orders' && (
          <OrdersPage
            data={data}
            onMoveOrder={handleMoveOrder}
            onOpenNewOrder={() => setNewOrderOpen(true)}
            onRefresh={refresh}
            onToast={(m) => showToast(m)}
          />
        )}
        {route === 'sales' && <SalesPage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'customers' && <CustomersPage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'insights' && <InsightsPage data={data} overview={overview} />}
        {route === 'payments' && <PaymentsPage overview={overview} />}
        {route === 'stock' && <StockPage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'team' && <TeamPage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'archive' && <ArchivePage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'settings' && <SettingsPage data={data} onRefresh={refresh} onToast={(m) => showToast(m)} />}
        {route === 'security' && <SecurityPage data={data} />}
        {route === 'help' && <HelpPage />}
      </Shell>

      {newOrderOpen && (
        <div className="modal-backdrop" onClick={() => setNewOrderOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>New order</strong>
              <button className="icon-btn" onClick={() => setNewOrderOpen(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input-field" placeholder="Arrangement title (e.g. Autumn hand-tie)" value={ordTitle} onChange={(e) => setOrdTitle(e.target.value)} />
              <input className="input-field" placeholder="Customer name" value={ordCust} onChange={(e) => setOrdCust(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="input-field" value={ordShop} onChange={(e) => setOrdShop(e.target.value)}>
                  <option value="canal">Canal St</option>
                  <option value="market">Market Hall</option>
                </select>
                <select className="input-field" value={ordFulfill} onChange={(e) => setOrdFulfill(e.target.value)}>
                  <option value="Collect">Collect</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input className="input-field tabular" value={ordDue} onChange={(e) => setOrdDue(e.target.value)} placeholder="Due time (16:30)" />
                <input type="number" className="input-field tabular" value={ordPrice} onChange={(e) => setOrdPrice(e.target.value)} placeholder="Total ($)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <select className="input-field" value={ordBucket} onChange={(e) => setOrdBucket(e.target.value as 'Today' | 'Tomorrow' | 'This week')}>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="This week">This week</option>
                </select>
                <select className="input-field" value={ordStaff} onChange={(e) => setOrdStaff(e.target.value)}>
                  {data.staff.map((st) => (
                    <option key={st.id} value={st.id}>{st.name.split(' ')[0]}</option>
                  ))}
                </select>
                <select className="input-field" value={ordPayStatus} onChange={(e) => setOrdPayStatus(e.target.value as 'Paid' | 'Unpaid')}>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', height: 40, marginTop: 6, opacity: !ordTitle.trim() || !ordCust.trim() ? 0.5 : 1 }}
                disabled={!ordTitle.trim() || !ordCust.trim()}
                onClick={handleCreateOrder}
              >
                Create order
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-bar">
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              className="btn btn-sm"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default App;
