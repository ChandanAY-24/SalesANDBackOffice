import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { BootstrapPayload } from '../types';

export const SettingsPage: React.FC<{
  data: BootstrapPayload;
  onRefresh: () => Promise<void>;
  onToast: (m: string) => void;
}> = ({ data, onRefresh, onToast }) => {
  const [biz, setBiz] = useState(data.settings.business_name);
  const [tax, setTax] = useState(String(data.settings.tax_rate_pct));
  const [footer, setFooter] = useState(data.settings.receipt_footer);
  const [autoLock, setAutoLock] = useState(String(data.settings.auto_lock_minutes || 10));
  const [tipPrompt, setTipPrompt] = useState(data.settings.tip_prompt_enabled);

  const save = async () => {
    try {
      await api.updateSettings({
        business_name: biz,
        tax_rate_pct: parseInt(tax || '8', 10),
        receipt_footer: footer,
        auto_lock_minutes: parseInt(autoLock || '10', 10),
        tip_prompt_enabled: tipPrompt,
      });
      await onRefresh();
      onToast('Settings saved');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Shop identity, tax rate, and register receipt preferences</p>
        </div>
        <button className="btn btn-primary" onClick={save}>Save changes</button>
      </div>

      <div className="card" style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Shop name</label>
          <input className="input-field" style={{ width: '100%' }} value={biz} onChange={(e) => setBiz(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Tax rate (%)</label>
            <input type="number" className="input-field tabular" style={{ width: '100%' }} value={tax} onChange={(e) => setTax(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Auto-lock timeout (min)</label>
            <input type="number" className="input-field tabular" style={{ width: '100%' }} value={autoLock} onChange={(e) => setAutoLock(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Receipt footer</label>
          <input className="input-field" style={{ width: '100%' }} value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
          <input type="checkbox" checked={tipPrompt} onChange={(e) => setTipPrompt(e.target.checked)} />
          <span>Show tip prompt on card &amp; phone pay checkout</span>
        </label>
      </div>
    </div>
  );
};

export const SecurityPage: React.FC<{ data: BootstrapPayload }> = ({ data }) => (
  <div>
    <div className="page-header">
      <div>
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">Till PINs, staff permissions, and auto-lock policy</p>
      </div>
    </div>

    <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 680 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Staff member</th>
            <th>Role</th>
            <th>Shop</th>
            <th>Till PIN</th>
          </tr>
        </thead>
        <tbody>
          {data.staff.map((st) => (
            <tr key={st.id}>
              <td><strong>{st.name}</strong></td>
              <td>{st.role}</td>
              <td>{st.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}</td>
              <td className="tabular">
                <span className="pill"><KeyRound size={12} /> ••••</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const HelpPage: React.FC = () => (
  <div>
    <div className="page-header">
      <div>
        <h1 className="page-title">Help &amp; shortcuts</h1>
        <p className="page-subtitle">Quick reference for counter staff and managers</p>
      </div>
    </div>

    <div className="help-grid">
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>Keyboard shortcuts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Open omnibar search</span><span className="kbd-pill">⌘K / Ctrl+K</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Close modal or popover</span><span className="kbd-pill">Esc</span></div>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>Daily checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={14} style={{ flexShrink: 0 }} /> <span>Check stems marked <strong>Soon</strong> on Overview</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={14} style={{ flexShrink: 0 }} /> <span>Drag completed orders to <strong>Handed over</strong></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={14} style={{ flexShrink: 0 }} /> <span>Count cash drawers in <strong>Archive</strong> before closing</span></div>
        </div>
      </div>
    </div>
  </div>
);
