import React, { useMemo, useState } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { api } from '../api';
import { BootstrapPayload, Order } from '../types';
import { formatMoneyWhole } from '../ui/format';

interface OrdersPageProps {
  data: BootstrapPayload;
  onMoveOrder: (orderId: string, newStage: string) => Promise<void>;
  onOpenNewOrder: () => void;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}

const STAGES: { name: string; dot: string; sub?: string }[] = [
  { name: 'New', dot: 'var(--blue)' },
  { name: 'Arranging', dot: 'var(--amber)' },
  { name: 'Ready', dot: 'var(--green)' },
  { name: 'Out for delivery', dot: '#b98eff', sub: 'Deliveries only' },
  { name: 'Handed over', dot: '#6ee7b7' },
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ data, onMoveOrder, onOpenNewOrder, onRefresh, onToast }) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [bucketFilter, setBucketFilter] = useState<'Today' | 'Tomorrow' | 'This week' | 'All'>('Today');
  const [fulfillFilter, setFulfillFilter] = useState<'All' | 'Collect' | 'Delivery'>('All');
  const [dragOrderId, setDragOrderId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return data.orders.filter((o) => {
      const bOk = bucketFilter === 'All' || o.due_bucket === bucketFilter;
      const fOk = fulfillFilter === 'All' || o.fulfillment === fulfillFilter;
      return bOk && fOk;
    });
  }, [data.orders, bucketFilter, fulfillFilter]);

  const openCount = data.orders.filter((o) => o.stage !== 'Handed over').length;
  const toMakeCount = data.orders.filter((o) => o.stage === 'New' || o.stage === 'Arranging').length;

  const benchStaff = ['st_aisha', 'st_jonah', 'st_mei'].map((sid) => {
    const st = data.staff.find((x) => x.id === sid);
    const count = data.orders.filter((o) => o.assigned_staff_id === sid && o.stage !== 'Handed over').length;
    return { id: sid, name: st?.name.split(' ')[0] || 'Staff', initials: st?.initials || 'ST', count };
  });

  const dueSoon = data.orders.filter((o) => o.due_bucket === 'Today' && o.due_time >= '14:00' && o.due_time <= '16:00');

  const getCountdown = (due: string) => {
    const [hh, mm] = due.split(':').map((n) => parseInt(n, 10));
    const mins = hh * 60 + mm - (14 * 60 + 40);
    if (mins <= 0) return 'now';
    if (mins < 60) return `in ${mins} min`;
    return `in ${Math.round(mins / 60)} h`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle tabular">{openCount} open · {toMakeCount} still to make</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="segmented">
            <button className={viewMode === 'board' ? 'active' : ''} onClick={() => setViewMode('board')}>Board</button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
          </div>
          <button className="btn btn-primary" onClick={onOpenNewOrder}>
            <Plus size={15} />
            <span>New order</span>
          </button>
        </div>
      </div>

      {/* Top Row: Due in next two hours | At the bench */}
      <div className="orders-top-grid">
        <div className="card">
          <div className="card-header" style={{ marginBottom: 10 }}>
            <div>
              <h3 className="card-title">Due in the next two hours</h3>
              <p className="card-sub">To finish or hand over</p>
            </div>
          </div>
          <div style={{ position: 'relative', paddingTop: 22, minHeight: 74 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)' }} className="tabular">
              {['14:00', '14:30', '15:00', '15:30', '16:00'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            {/* Now marker at 14:40 (~33%) */}
            <div style={{ position: 'absolute', top: 18, bottom: 0, left: '33%', borderLeft: '1.5px dashed rgba(242,133,113,0.55)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {dueSoon.map((o) => {
                const [hh, mm] = o.due_time.split(':').map((n) => parseInt(n, 10));
                const pct = Math.max(0, Math.min(62, ((hh * 60 + mm - 14 * 60) / 120) * 100));
                return (
                  <div
                    key={o.id}
                    style={{
                      marginLeft: `${pct}%`,
                      maxWidth: `calc(100% - ${pct}%)`,
                      width: 'fit-content',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <span className="dot-green" style={{ background: o.stage === 'Ready' ? 'var(--green)' : 'var(--amber)' }} />
                    <span style={{ fontWeight: 600 }}>{o.title}</span>
                    <span className="tabular" style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>{o.due_time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 10 }}>
            <div>
              <h3 className="card-title">At the bench</h3>
              <p className="card-sub">Open orders per florist</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {benchStaff.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                <span className="avatar-circle" style={{ width: 22, height: 22, fontSize: 9.5 }}>{b.initials}</span>
                <span style={{ width: 52 }}>{b.name}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, b.count * 22)}%`, height: '100%', background: 'var(--accent-coral)' }} />
                </div>
                <span className="tabular" style={{ width: 18, textAlign: 'right', fontWeight: 600 }}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="segmented">
          {(['Today', 'Tomorrow', 'This week', 'All'] as const).map((b) => (
            <button key={b} className={bucketFilter === b ? 'active' : ''} onClick={() => setBucketFilter(b)}>
              {b}
            </button>
          ))}
        </div>
        <div className="segmented">
          {(['All', 'Collect', 'Delivery'] as const).map((f) => (
            <button key={f} className={fulfillFilter === f ? 'active' : ''} onClick={() => setFulfillFilter(f)}>
              {f === 'All' ? 'All types' : f}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="kanban-grid">
          {STAGES.map((stMeta) => {
            const colOrders = filteredOrders.filter((o) => o.stage === stMeta.name);
            return (
              <div
                key={stMeta.name}
                className={`kanban-col ${dragOverStage === stMeta.name ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stMeta.name);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOverStage(null);
                  const oid = e.dataTransfer.getData('text/plain') || dragOrderId;
                  if (oid) {
                    await onMoveOrder(oid, stMeta.name);
                  }
                  setDragOrderId(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 2px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: stMeta.dot }} />
                    <strong style={{ fontSize: 13 }}>{stMeta.name}</strong>
                  </span>
                  <span className="nav-badge tabular">{colOrders.length}</span>
                </div>
                {stMeta.sub && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 4, marginBottom: 2 }}>{stMeta.sub}</div>
                )}
                {colOrders.map((o: Order) => {
                  const st = data.staff.find((x) => x.id === o.assigned_staff_id);
                  return (
                    <div
                      key={o.id}
                      className={`order-card ${dragOrderId === o.id ? 'dragging' : ''}`}
                      draggable
                      onClick={() => setEditingOrder(o)}
                      onDragStart={(e) => {
                        setDragOrderId(o.id);
                        e.dataTransfer.setData('text/plain', o.id);
                      }}
                      onDragEnd={() => {
                        setDragOrderId(null);
                        setDragOverStage(null);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                        <span className="tabular" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {o.due_time} · {getCountdown(o.due_time)}
                        </span>
                        <span>{o.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}</span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{o.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 9 }}>
                        {o.customer_name} · {o.fulfillment}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={`pill ${o.payment_status === 'Paid' ? 'green' : 'amber'}`}>
                          • {o.payment_status}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {st && <span className="kbd-pill">{st.initials}</span>}
                          <strong className="tabular" style={{ fontSize: 13 }}>{formatMoneyWhole(o.total_cents)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Due</th>
                <th>Stage</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="tabular" style={{ color: 'var(--text-muted)' }}>{o.code}</td>
                  <td><strong>{o.title}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{o.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}</td>
                  <td className="tabular">{o.due_time}</td>
                  <td>
                    <select
                      className="pill-select"
                      value={o.stage}
                      onChange={(e) => onMoveOrder(o.id, e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`pill ${o.payment_status === 'Paid' ? 'green' : 'amber'}`}>• {o.payment_status}</span>
                  </td>
                  <td className="tabular" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatMoneyWhole(o.total_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <div className="modal-backdrop" onClick={() => setEditingOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{editingOrder.code} · {editingOrder.customer_name}</div>
                <strong style={{ fontSize: 16 }}>{editingOrder.title}</strong>
              </div>
              <button className="icon-btn" onClick={() => setEditingOrder(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Stage</label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={editingOrder.stage}
                    onChange={(e) => setEditingOrder({ ...editingOrder, stage: e.target.value })}
                  >
                    {STAGES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Florist</label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={editingOrder.assigned_staff_id || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, assigned_staff_id: e.target.value || null })}
                  >
                    <option value="">Unassigned</option>
                    {data.staff.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Payment</label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={editingOrder.payment_status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value })}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fulfillment</label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={editingOrder.fulfillment}
                    onChange={(e) => setEditingOrder({ ...editingOrder, fulfillment: e.target.value })}
                  >
                    <option value="Collect">Collect</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Due time</label>
                  <input
                    className="input-field tabular"
                    style={{ width: '100%' }}
                    value={editingOrder.due_time}
                    onChange={(e) => setEditingOrder({ ...editingOrder, due_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notes</label>
                <input
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="Card message or stem notes"
                  value={editingOrder.notes}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button className="btn" onClick={() => setEditingOrder(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await api.updateOrder(editingOrder.id, {
                        stage: editingOrder.stage,
                        assigned_staff_id: editingOrder.assigned_staff_id,
                        payment_status: editingOrder.payment_status,
                        fulfillment: editingOrder.fulfillment,
                        due_time: editingOrder.due_time,
                        notes: editingOrder.notes,
                      });
                      await onRefresh();
                      onToast(`Updated ${editingOrder.title}`);
                      setEditingOrder(null);
                    } catch (err) {
                      onToast(err instanceof Error ? err.message : 'Failed to update order');
                    }
                  }}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
