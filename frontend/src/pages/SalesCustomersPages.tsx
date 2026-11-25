import React, { useState } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import { api } from '../api';
import { BootstrapPayload, Sale } from '../types';
import { formatMoney } from '../ui/format';

export const SalesPage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Sale | null>(null);

  const filtered = data.sales.filter(
    (s) =>
      !query ||
      s.receipt_no.toLowerCase().includes(query.toLowerCase()) ||
      s.summary_text.toLowerCase().includes(query.toLowerCase())
  );

  const handleRefund = async (s: Sale) => {
    try {
      await api.refundSale(s.id);
      await onRefresh();
      setSelected(null);
      onToast(`Refunded ${s.receipt_no} (${formatMoney(s.total_cents)})`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Refund failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">All till transactions, receipts, and refunds</p>
        </div>
        <div className="search-field" style={{ minWidth: 230 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter receipt or item..."
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Time</th>
              <th>Items</th>
              <th>Shop</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
                <td className="tabular"><strong>{s.receipt_no}</strong></td>
                <td className="tabular" style={{ color: 'var(--text-muted)' }}>{s.time_label}</td>
                <td>{s.summary_text}</td>
                <td>{s.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}</td>
                <td><span className="pill">{s.payment_method}</span></td>
                <td>
                  <span className={`pill ${s.status === 'Completed' ? 'green' : 'red'}`}>• {s.status}</span>
                </td>
                <td className="tabular" style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(s.total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong>Receipt {selected.receipt_no}</strong>
              <span className={`pill ${selected.status === 'Completed' ? 'green' : 'red'}`}>{selected.status}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {selected.payment_method} · {selected.time_label} · {selected.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}
            </div>
            {selected.items && selected.items.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '10px 0', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                {selected.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.qty > 1 ? `${it.qty} × ` : ''}{it.name}</span>
                    <span className="tabular">{formatMoney(it.line_total_cents)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span className="tabular">{formatMoney(selected.subtotal_cents)}</span>
              </div>
              {selected.discount_cents > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
                  <span>Discount ({selected.discount_type})</span>
                  <span className="tabular">-{formatMoney(selected.discount_cents)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax</span>
                <span className="tabular">{formatMoney(selected.tax_cents)}</span>
              </div>
              {selected.tip_cents > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tip</span>
                  <span className="tabular">{formatMoney(selected.tip_cents)}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              <span>Total</span>
              <span className="tabular">{formatMoney(selected.total_cents)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {selected.status === 'Completed' && (
                <button className="btn" style={{ color: 'var(--red)' }} onClick={() => handleRefund(selected)}>
                  <RotateCcw size={14} /> Issue refund
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CustomersPage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Regular');
  const [notes, setNotes] = useState('');

  const filteredCustomers = data.customers.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.notes.toLowerCase().includes(query.toLowerCase())
  );

  const openNew = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setTier('Regular');
    setNotes('');
    setAdding(true);
  };

  const openEdit = (c: BootstrapPayload['customers'][number]) => {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setTier(c.tier);
    setNotes(c.notes);
    setAdding(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (editingId) {
        await api.updateCustomer(editingId, { email, phone, tier, notes });
        onToast(`Updated customer ${name}`);
      } else {
        await api.createCustomer({ name: name.trim(), email, phone, tier, notes });
        onToast(`Added customer ${name.trim()}`);
      }
      await onRefresh();
      setAdding(false);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save customer');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{data.customers.length} saved profiles across both shops</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-field" style={{ minWidth: 210 }}>
            <Search size={14} color="var(--text-muted)" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer..." />
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={15} /> Add customer
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Tier</th>
              <th>Contact</th>
              <th>Notes</th>
              <th style={{ textAlign: 'right' }}>Visits</th>
              <th style={{ textAlign: 'right' }}>Total spent</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(c)}>
                <td><strong>{c.name}</strong></td>
                <td>
                  <span className={`pill ${c.tier === 'VIP' ? 'coral' : c.tier === 'Corporate' ? 'blue' : ''}`}>{c.tier}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.email || c.phone || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.notes || '—'}</td>
                <td className="tabular" style={{ textAlign: 'right' }}>{c.visits_count}</td>
                <td className="tabular" style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(c.total_spent_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div className="modal-backdrop" onClick={() => setAdding(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>{editingId ? 'Edit customer' : 'New customer'}</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input-field" placeholder="Full name" value={name} disabled={Boolean(editingId)} onChange={(e) => setName(e.target.value)} />
              <input className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <select className="input-field" value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
              </select>
              <input className="input-field" placeholder="Preferences / notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button className="btn" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={!name.trim()} style={{ opacity: !name.trim() ? 0.5 : 1 }} onClick={handleSave}>
                  {editingId ? 'Update customer' : 'Save customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
