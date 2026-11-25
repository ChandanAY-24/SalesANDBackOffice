import React from 'react';
import { BootstrapPayload, OverviewData } from '../types';
import { formatMoney, formatMoneyWhole } from '../ui/format';

export const InsightsPage: React.FC<{ data: BootstrapPayload; overview: OverviewData }> = ({ data, overview }) => {
  const busyHours = [
    { hour: '09:00', pct: 48 },
    { hour: '10:00', pct: 74 },
    { hour: '11:00', pct: 92 },
    { hour: '12:00', pct: 68 },
    { hour: '13:00', pct: 55 },
    { hour: '14:00', pct: 61 },
    { hour: '15:00', pct: 78 },
    { hour: '16:00', pct: 84 },
    { hour: '17:00', pct: 64 },
  ];

  const categories = ['Bouquets', 'Single stems', 'Plants', 'Gifts & vases', 'Workshops'].map((cat, idx) => ({
    cat,
    count: data.products.filter((p) => p.category === cat).length,
    share: [54, 21, 14, 7, 4][idx],
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">Busy-hours profile, category mix, and shop comparison</p>
        </div>
      </div>

      <div className="insights-top-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Busy hours</h3>
              <p className="card-sub">Average footfall &amp; till volume by hour</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 170, paddingTop: 14 }}>
            {busyHours.map((b) => (
              <div key={b.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '65%', height: Math.round(b.pct * 1.3), background: b.pct > 80 ? 'var(--accent-coral)' : 'var(--bg-surface-2)', borderRadius: '6px 6px 2px 2px' }} />
                <span className="tabular" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.hour.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Revenue by category</h3>
              <p className="card-sub">Share of takings across {data.products.length} SKUs</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map((c) => (
              <div key={c.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span><strong>{c.cat}</strong> ({c.count} items)</span>
                  <span className="tabular">{c.share}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${c.share}%`, height: '100%', background: 'var(--accent-coral)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Shop comparison</h3>
            <p className="card-sub">Canal St vs Market Hall today</p>
          </div>
        </div>
        <div className="shop-compare-grid">
          {data.shops.map((sh, i) => (
            <div key={sh.id} className="till-box" style={{ padding: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{sh.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sh.address} · till {sh.close_time}</div>
              </div>
              <div className="tabular" style={{ fontSize: 20, fontWeight: 700 }}>
                {formatMoneyWhole(Math.round(overview.takings_cents * (i === 0 ? 0.62 : 0.38)))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PaymentsPage: React.FC<{ overview: OverviewData }> = ({ overview }) => {
  const payouts = [
    { id: 'PO-904', date: 'Sat 24 Oct (Tomorrow)', channels: 'Cards & phone pay', amount: 270300, status: 'Scheduled' },
    { id: 'PO-903', date: 'Thu 22 Oct', channels: 'Cards & phone pay', amount: 248900, status: 'Paid out' },
    { id: 'PO-902', date: 'Wed 21 Oct', channels: 'Cards & phone pay', amount: 194500, status: 'Paid out' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments &amp; payouts</h1>
          <p className="page-subtitle">Tender breakdown and bank settlement schedule</p>
        </div>
      </div>

      <div className="payments-kpi-grid">
        {overview.payments_breakdown.map((pm) => (
          <div key={pm.method} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pm.method}</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{formatMoney(pm.amount_cents)}</div>
            <div className="tabular" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{pm.pct}% of today</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payout</th>
              <th>Settlement date</th>
              <th>Channels</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="tabular"><strong>{p.id}</strong></td>
                <td>{p.date}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.channels}</td>
                <td><span className={`pill ${p.status === 'Paid out' ? 'green' : 'blue'}`}>• {p.status}</span></td>
                <td className="tabular" style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
