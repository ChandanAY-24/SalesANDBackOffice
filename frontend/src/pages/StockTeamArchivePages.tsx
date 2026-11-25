import React, { useState } from 'react';
import { CheckCircle2, Download, Minus, Plus, Search, Truck, X } from 'lucide-react';
import { api } from '../api';
import { BootstrapPayload, Shift } from '../types';
import { formatMoney } from '../ui/format';

export const StockPage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [filter, setFilter] = useState<'all' | 'stems' | 'low'>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [sku, setSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [category, setCategory] = useState('Single stems');
  const [price, setPrice] = useState('6.50');
  const [stockQty, setStockQty] = useState('24');
  const [parLevel, setParLevel] = useState('15');
  const [vaseLife, setVaseLife] = useState('6');

  const items = data.products.filter((p) => {
    const q = query.trim().toLowerCase();
    const qOk = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    if (!qOk) return false;
    if (filter === 'stems') return p.vase_life_days !== null;
    if (filter === 'low') return p.stock_qty < p.par_level;
    return true;
  });

  const adjustStock = async (id: string, nextQty: number) => {
    try {
      await api.updateProduct(id, { stock_qty: Math.max(0, nextQty) });
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to update stock');
    }
  };

  const checkin = async (id: string, supplier: string) => {
    try {
      await api.checkinDelivery(id);
      await onRefresh();
      onToast(`Checked in delivery from ${supplier}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to check in delivery');
    }
  };

  const handleAddProduct = async () => {
    if (!sku.trim() || !prodName.trim()) return;
    try {
      await api.createProduct({
        sku: sku.trim().toUpperCase(),
        name: prodName.trim(),
        category,
        price_cents: Math.round(parseFloat(price || '0') * 100),
        stock_qty: parseInt(stockQty || '10', 10),
        par_level: parseInt(parLevel || '10', 10),
        vase_life_days: category === 'Single stems' ? parseInt(vaseLife || '6', 10) : null,
        freshness_status: 'Fresh',
        icon_key: category === 'Plants' ? 'plant' : category === 'Single stems' ? 'stem' : 'bouquet',
      });
      await onRefresh();
      setAdding(false);
      setSku('');
      setProdName('');
      onToast(`Added ${prodName.trim()} to catalog`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock &amp; stems</h1>
          <p className="page-subtitle">Vase-life countdowns, par levels, and incoming stem deliveries</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-field" style={{ minWidth: 190 }}>
            <Search size={14} color="var(--text-muted)" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter stem or SKU..." />
          </div>
          <div className="segmented">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({data.products.length})</button>
            <button className={filter === 'stems' ? 'active' : ''} onClick={() => setFilter('stems')}>Single stems</button>
            <button className={filter === 'low' ? 'active' : ''} onClick={() => setFilter('low')}>Below par</button>
          </div>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            <Plus size={15} /> Add item
          </button>
        </div>
      </div>

      {/* Incoming Deliveries */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Deliveries</h3>
            <p className="card-sub">Check in incoming flower boxes to top up stem counts</p>
          </div>
        </div>
        <div className="deliveries-grid">
          {data.deliveries.map((d) => (
            <div key={d.id} className="till-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <strong style={{ fontSize: 13 }}>{d.supplier}</strong>
                <span className={`pill ${d.status === 'Checked in' ? 'green' : 'amber'}`}>{d.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.items_summary}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="tabular" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{d.eta}</span>
                {d.status !== 'Checked in' ? (
                  <button className="btn btn-sm btn-primary" onClick={() => checkin(d.id, d.supplier)}>
                    <Truck size={13} /> Check in
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> Stocked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Category</th>
              <th>Vase life</th>
              <th>Par</th>
              <th>In stock</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className="tabular" style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>
                  {p.vase_life_days !== null ? (
                    <span className={`pill ${p.vase_life_days <= 2 ? 'amber' : 'green'}`}>
                      {p.vase_life_days}d left · {p.vase_life_days <= 2 ? 'Soon' : 'Fresh'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td className="tabular" style={{ color: 'var(--text-muted)' }}>{p.par_level}</td>
                <td className="tabular" style={{ fontWeight: 700, color: p.stock_qty < p.par_level ? 'var(--amber)' : 'var(--text-primary)' }}>
                  {p.stock_qty}
                </td>
                <td>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button className="icon-btn" title="Decrease by 1" onClick={() => adjustStock(p.id, p.stock_qty - 1)}><Minus size={13} /></button>
                    <button className="icon-btn" title="Add 5" onClick={() => adjustStock(p.id, p.stock_qty + 5)}><Plus size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div className="modal-backdrop" onClick={() => setAdding(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>Add stock item</strong>
              <button className="icon-btn" onClick={() => setAdding(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                <input className="input-field" placeholder="SKU (e.g. STM-21)" value={sku} onChange={(e) => setSku(e.target.value)} />
                <input className="input-field" placeholder="Item name" value={prodName} onChange={(e) => setProdName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Single stems">Single stems</option>
                  <option value="Bouquets">Bouquets</option>
                  <option value="Plants">Plants</option>
                  <option value="Gifts & vases">Gifts &amp; vases</option>
                  <option value="Workshops">Workshops</option>
                </select>
                <input type="number" step="0.01" className="input-field tabular" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>In stock</label>
                  <input type="number" className="input-field tabular" style={{ width: '100%' }} value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Par level</label>
                  <input type="number" className="input-field tabular" style={{ width: '100%' }} value={parLevel} onChange={(e) => setParLevel(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Vase days</label>
                  <input type="number" className="input-field tabular" style={{ width: '100%' }} disabled={category !== 'Single stems'} value={vaseLife} onChange={(e) => setVaseLife(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button className="btn" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={!sku.trim() || !prodName.trim()} style={{ opacity: !sku.trim() || !prodName.trim() ? 0.5 : 1 }} onClick={handleAddProduct}>
                  Save item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TeamPage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [dragShiftId, setDragShiftId] = useState<string | null>(null);
  const [addingShift, setAddingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [staffId, setStaffId] = useState(data.staff[0]?.id || 'st_ines');
  const [shopId, setShopId] = useState('canal');
  const [dayOfWeek, setDayOfWeek] = useState('Fri');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [roleLabel, setRoleLabel] = useState('Florist');

  const moveShift = async (shiftId: string, day: string) => {
    try {
      await api.updateShift(shiftId, { day_of_week: day });
      await onRefresh();
      onToast(`Moved shift to ${day}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to move shift');
    }
  };

  const handleCreateShift = async () => {
    try {
      await api.createShift({
        staff_id: staffId,
        shop_id: shopId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        role_label: roleLabel,
      });
      await onRefresh();
      setAddingShift(false);
      onToast(`Added ${dayOfWeek} shift`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create shift');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team &amp; rota</h1>
          <p className="page-subtitle">Drag shifts across days to balance Canal St and Market Hall</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddingShift(true)}>
          <Plus size={15} /> Add shift
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 10, overflowX: 'auto' }}>
        {DAYS.map((day) => {
          const dayShifts = data.shifts.filter((sh) => sh.day_of_week === day);
          return (
            <div
              key={day}
              className="kanban-col"
              style={{ minHeight: 280 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const sid = e.dataTransfer.getData('text/plain') || dragShiftId;
                if (sid) await moveShift(sid, day);
                setDragShiftId(null);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px 6px' }}>
                <strong style={{ fontSize: 13 }}>{day}</strong>
                <span className="nav-badge tabular">{dayShifts.length}</span>
              </div>
              {dayShifts.map((sh) => {
                const st = data.staff.find((x) => x.id === sh.staff_id);
                return (
                  <div
                    key={sh.id}
                    className="order-card"
                    draggable
                    onClick={() => setEditingShift(sh)}
                    onDragStart={(e) => {
                      setDragShiftId(sh.id);
                      e.dataTransfer.setData('text/plain', sh.id);
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{st?.name || 'Staff'}</div>
                    <div className="tabular" style={{ fontSize: 11.5, color: 'var(--accent-coral)' }}>
                      {sh.start_time} – {sh.end_time}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {sh.shop_id === 'canal' ? 'Canal St' : 'Market Hall'} · {sh.role_label}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {addingShift && (
        <div className="modal-backdrop" onClick={() => setAddingShift(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>Add shift</strong>
              <button className="icon-btn" onClick={() => setAddingShift(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select className="input-field" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                {data.staff.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="input-field" value={shopId} onChange={(e) => setShopId(e.target.value)}>
                  <option value="canal">Canal St</option>
                  <option value="market">Market Hall</option>
                </select>
                <select className="input-field" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input className="input-field tabular" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="09:00" />
                <input className="input-field tabular" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="17:00" />
                <input className="input-field" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} placeholder="Role" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button className="btn" onClick={() => setAddingShift(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateShift}>Save shift</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingShift && (
        <div className="modal-backdrop" onClick={() => setEditingShift(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>
                Edit shift · {data.staff.find((x) => x.id === editingShift.staff_id)?.name || 'Staff'}
              </strong>
              <button className="icon-btn" onClick={() => setEditingShift(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="input-field" value={editingShift.shop_id} onChange={(e) => setEditingShift({ ...editingShift, shop_id: e.target.value })}>
                  <option value="canal">Canal St</option>
                  <option value="market">Market Hall</option>
                </select>
                <select className="input-field" value={editingShift.day_of_week} onChange={(e) => setEditingShift({ ...editingShift, day_of_week: e.target.value })}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input className="input-field tabular" value={editingShift.start_time} onChange={(e) => setEditingShift({ ...editingShift, start_time: e.target.value })} />
                <input className="input-field tabular" value={editingShift.end_time} onChange={(e) => setEditingShift({ ...editingShift, end_time: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button className="btn" onClick={() => setEditingShift(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await api.updateShift(editingShift.id, {
                        shop_id: editingShift.shop_id,
                        day_of_week: editingShift.day_of_week,
                        start_time: editingShift.start_time,
                        end_time: editingShift.end_time,
                      });
                      await onRefresh();
                      onToast('Shift updated');
                      setEditingShift(null);
                    } catch (err) {
                      onToast(err instanceof Error ? err.message : 'Failed to update shift');
                    }
                  }}
                >
                  Save shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ArchivePage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [counts, setCounts] = useState<Record<string, string>>({});

  const closeTill = async (tillId: string, expected: number) => {
    const raw = counts[tillId];
    const counted = raw ? Math.round(parseFloat(raw) * 100) : expected;
    try {
      await api.closeTill(tillId, counted, 'Ines Okafor');
      await onRefresh();
      onToast('Till counted & closed');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to close till');
    }
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const header = 'Receipt,Shop,Payment,Status,Total\n';
    const rows = data.sales
      .map((s) => `${esc(s.receipt_no)},${esc(s.shop_id)},${esc(s.payment_method)},${esc(s.status)},${(s.total_cents / 100).toFixed(2)}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petalo-sales-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Exported sales CSV');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tills, day closes &amp; archive</h1>
          <p className="page-subtitle">Count cash drawers, record day closes, and export sales</p>
        </div>
        <button className="btn btn-primary" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="tills-row" style={{ marginBottom: 18 }}>
        {data.tills.map((t) => (
          <div key={t.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{t.label}</strong>
              <span className={`pill ${t.status === 'Open' ? 'green' : ''}`}>{t.status}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              Expected cash: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>{formatMoney(t.expected_cash_cents)}</strong>
            </div>
            {t.status === 'Open' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder={(t.expected_cash_cents / 100).toFixed(2)}
                  value={counts[t.id] || ''}
                  onChange={(e) => setCounts({ ...counts, [t.id]: e.target.value })}
                  className="pill-select tabular"
                  style={{ flex: 1, borderRadius: 9 }}
                />
                <button className="btn btn-sm btn-primary" onClick={() => closeTill(t.id, t.expected_cash_cents)}>
                  Close till
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Shop</th>
              <th>Closed by</th>
              <th style={{ textAlign: 'right' }}>Total sales</th>
              <th style={{ textAlign: 'right' }}>Cash counted</th>
              <th style={{ textAlign: 'right' }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {data.day_closes.map((dc) => (
              <tr key={dc.id}>
                <td><strong>{dc.date_label}</strong></td>
                <td>{dc.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}</td>
                <td>{dc.closed_by}</td>
                <td className="tabular" style={{ textAlign: 'right' }}>{formatMoney(dc.total_sales_cents)}</td>
                <td className="tabular" style={{ textAlign: 'right' }}>{formatMoney(dc.cash_counted_cents)}</td>
                <td className="tabular" style={{ textAlign: 'right', color: dc.variance_cents === 0 ? 'var(--green)' : 'var(--amber)' }}>
                  {formatMoney(dc.variance_cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
