import React, { useState } from 'react';
import {
  ArrowUpRight,
  Banknote,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Gift,
  Leaf,
  Receipt,
  Smartphone,
  Users,
} from 'lucide-react';
import { BootstrapPayload, NavRoute, OverviewData } from '../types';
import { formatMoney, formatMoneyWhole } from '../ui/format';

interface OverviewPageProps {
  data: BootstrapPayload;
  overview: OverviewData;
  rangeMode: 'today' | 'week' | 'month';
  onChangeRange: (r: 'today' | 'week' | 'month') => void;
  onNavigate: (r: NavRoute) => void;
  onOpenNewOrder: () => void;
}

const SPARKLINES: Record<string, string> = {
  Card: 'M 0 13 C 10 11, 18 14, 28 8 S 45 10, 60 4',
  'Phone pay': 'M 0 11 C 12 14, 22 7, 32 10 S 48 6, 60 5',
  Cash: 'M 0 9 C 12 7, 22 13, 34 9 S 48 11, 60 12',
  'Gift card': 'M 0 14 L 60 14',
};

export const OverviewPage: React.FC<OverviewPageProps> = ({
  data,
  overview,
  rangeMode,
  onChangeRange,
  onNavigate,
  onOpenNewOrder,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [bestMode, setBestMode] = useState<'takings' | 'units'>('takings');

  const yTicks =
    rangeMode === 'today'
      ? [
          { label: '$1K', val: 100000 },
          { label: '$750', val: 75000 },
          { label: '$500', val: 50000 },
          { label: '$250', val: 25000 },
          { label: '$0', val: 0 },
        ]
      : rangeMode === 'week'
        ? [
            { label: '$5K', val: 500000 },
            { label: '$4K', val: 400000 },
            { label: '$2K', val: 200000 },
            { label: '$1K', val: 100000 },
            { label: '$0', val: 0 },
          ]
        : [
            { label: '$25K', val: 2500000 },
            { label: '$20K', val: 2000000 },
            { label: '$10K', val: 1000000 },
            { label: '$5K', val: 500000 },
            { label: '$0', val: 0 },
          ];
  const maxSeriesVal = yTicks[0].val;

  const openTodayOrders = data.orders
    .filter((o) => o.due_bucket === 'Today' && o.stage !== 'Handed over')
    .sort((a, b) => a.due_time.localeCompare(b.due_time));
  const dueTodayCount = openTodayOrders.length;
  const nextDueOrder = openTodayOrders[0];
  const soonStems = data.products.filter((p) => p.vase_life_days !== null && p.vase_life_days <= 3);
  const onFloor = data.staff.filter((s) => s.active_on_floor);
  const todaysOrders = data.orders.filter((o) => o.due_bucket === 'Today').slice(0, 8);
  const handedCount = data.orders.filter((o) => o.due_bucket === 'Today' && o.stage === 'Handed over').length;
  const nextPayoutCents = overview.payments_breakdown
    .filter((pm) => pm.method === 'Card' || pm.method === 'Phone pay')
    .reduce((acc, pm) => acc + pm.amount_cents, 0);
  const lastClose = data.day_closes[0];

  const bestSellers = [
    { name: 'Hand-tie, large', category: 'Bouquets', takings: 189000, units: 15 },
    { name: 'Dahlia & rosehip tie', category: 'Bouquets', takings: 174000, units: 30 },
    { name: 'Hand-tie, medium', category: 'Bouquets', takings: 136500, units: 16 },
    { name: 'Olive tree, 1m', category: 'Plants', takings: 120000, units: 10 },
    { name: 'Dried meadow wreath', category: 'Bouquets', takings: 108000, units: 15 },
    { name: 'Hand-tie, small', category: 'Bouquets', takings: 99000, units: 21 },
  ];
  const maxBest = Math.max(...bestSellers.map((b) => (bestMode === 'takings' ? b.takings : b.units)));

  const pmMeta: Record<string, { color: string; icon: React.ReactNode }> = {
    Card: { color: 'var(--accent-coral)', icon: <CreditCard size={14} /> },
    'Phone pay': { color: 'var(--blue)', icon: <Smartphone size={14} /> },
    Cash: { color: 'var(--amber)', icon: <Banknote size={14} /> },
    'Gift card': { color: 'var(--green)', icon: <Gift size={14} /> },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good afternoon, Ines</h1>
          <p className="page-subtitle">
            Friday, October 23 · open — Canal St till 19:00, Market Hall till 17:00 · {dueTodayCount} orders still due today
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={onOpenNewOrder}>
            <Receipt size={15} />
            <span>New order</span>
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('register')}>
            <Calculator size={15} />
            <span>Open register</span>
          </button>
        </div>
      </div>

      {/* Top Row: Takings + 2x2 Bento */}
      <div className="overview-top">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Takings</h2>
              <p className="card-sub">
                {rangeMode === 'today'
                  ? 'Both shops · by hour, against last Friday'
                  : rangeMode === 'week'
                    ? 'Last 7 days, against the week before'
                    : 'Last 4 weeks, against prior month'}
              </p>
            </div>
            <div className="segmented">
              {(['today', 'week', 'month'] as const).map((r) => (
                <button key={r} className={rangeMode === r ? 'active' : ''} onClick={() => onChangeRange(r)}>
                  {r === 'today' ? 'Today' : r === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span className="tabular" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>
              {formatMoney(overview.takings_cents)}
            </span>
            <span
              className="tabular"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: overview.delta_pct >= 0 ? 'var(--green)' : 'var(--accent-coral)',
              }}
            >
              {overview.delta_pct >= 0 ? '↗ +' : '↘ '}
              {overview.delta_pct}% {rangeMode === 'today' ? 'vs last Friday at this time' : 'vs previous period'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 28, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Sales</div>
              <div className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{overview.sales_count}</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Average basket</div>
              <div className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{formatMoney(overview.average_basket_cents)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Refunds</div>
              <div className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>{formatMoney(overview.refunds_cents)}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: 'var(--text-secondary)' }}>
              <span><span style={{ color: 'var(--accent-coral)' }}>●</span> {rangeMode === 'today' ? 'Today' : 'Current'}</span>
              <span><span style={{ opacity: 0.45 }}>○</span> {rangeMode === 'today' ? 'Last Friday' : 'Previous'}</span>
            </div>
          </div>

          {/* Interactive Bar Chart with Y-axis & Dotted Current Hour Marker */}
          <div style={{ display: 'flex', gap: 10, height: 175 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 20, fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'right', width: 32 }} className="tabular">
              {yTicks.map((t) => (
                <span key={t.label}>{t.label}</span>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10, paddingBottom: 20 }}>
              {/* Horizontal Gridlines */}
              {yTicks.slice(0, -1).map((t, i) => (
                <div
                  key={t.label}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${i * 25}%`,
                    borderTop: '1px solid var(--border-subtle)',
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {overview.series.map((pt, idx) => {
                const curH = Math.min(138, Math.max(0, Math.round((pt.current / maxSeriesVal) * 138)));
                const prevH = Math.min(138, Math.max(4, Math.round((pt.previous / maxSeriesVal) * 138)));
                const isHover = hoveredIdx === idx;
                const isCurrentHour = rangeMode === 'today' && pt.label === '14';
                return (
                  <div
                    key={pt.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    {isCurrentHour && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: '50%',
                          borderLeft: '1.5px dashed var(--text-muted)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: -3,
                            left: -4,
                            width: 7,
                            height: 7,
                            borderRadius: 999,
                            background: 'var(--text-primary)',
                          }}
                        />
                      </div>
                    )}

                    {isHover && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: Math.max(curH, prevH) + 12,
                          background: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 9,
                          padding: '6px 10px',
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                          zIndex: 20,
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{pt.label}</div>
                        <div className="tabular"><span style={{ color: 'var(--accent-coral)' }}>●</span> {rangeMode === 'today' ? 'Today' : 'Current'} {formatMoney(pt.current)}</div>
                        <div className="tabular" style={{ color: 'var(--text-muted)' }}>○ {rangeMode === 'today' ? 'Last Friday' : 'Previous'} {formatMoney(pt.previous)}</div>
                      </div>
                    )}

                    <div style={{ position: 'relative', width: '100%', height: 138, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          width: '74%',
                          height: prevH,
                          background: 'var(--bg-surface-hover)',
                          borderRadius: 6,
                        }}
                      />
                      {pt.current > 0 && (
                        <div
                          style={{
                            position: 'relative',
                            width: '54%',
                            height: curH,
                            background: isHover ? 'var(--accent-coral-hover)' : 'var(--accent-coral)',
                            borderRadius: 6,
                            transition: 'height 220ms ease',
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="tabular"
                      style={{ position: 'absolute', bottom: -20, fontSize: 11, color: isCurrentHour ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isCurrentHour ? 600 : 400 }}
                    >
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bento-2x2">
          <div className="bento-card brown" onClick={() => onNavigate('orders')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="bento-icon-pill"><ClipboardList size={13} /></span>
                Orders due today
              </span>
              <ArrowUpRight size={14} />
            </div>
            <div>
              <div className="bento-num tabular">{dueTodayCount}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nextDueOrder ? `Next: ${nextDueOrder.title} · ${nextDueOrder.due_time}` : 'All caught up for today'}
              </div>
            </div>
          </div>

          <div className="bento-card olive" onClick={() => onNavigate('stock')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="bento-icon-pill"><Leaf size={13} /></span>
                Stems to use first
              </span>
              <ArrowUpRight size={14} />
            </div>
            <div>
              <div className="bento-num tabular">{soonStems.length}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {soonStems.length > 0 ? `${soonStems.slice(0, 2).map((s) => s.name).join(', ')} · ≤ 3d` : 'All stems fresh'}
              </div>
            </div>
          </div>

          <div className="bento-card slate" onClick={() => onNavigate('team')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="bento-icon-pill"><Users size={13} /></span>
                On the floor
              </span>
              <ArrowUpRight size={14} />
            </div>
            <div>
              <div className="bento-num tabular">{onFloor.length}</div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                {onFloor.slice(0, 5).map((st, idx) => (
                  <span
                    key={st.id}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: st.avatar_color,
                      color: '#171615',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'grid',
                      placeItems: 'center',
                      border: '2px solid var(--bg-surface)',
                      marginLeft: idx === 0 ? 0 : -6,
                    }}
                  >
                    {st.initials}
                  </span>
                ))}
                {onFloor.length > 5 && (
                  <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--text-secondary)' }}>+{onFloor.length - 5}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bento-card forest" onClick={() => onNavigate('payments')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="bento-icon-pill"><Building2 size={13} /></span>
                Next payout
              </span>
              <ArrowUpRight size={14} />
            </div>
            <div>
              <div className="bento-num tabular">{formatMoneyWhole(nextPayoutCents)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Lands tomorrow · cards &amp; phone
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mid Row: Pick-ups & deliveries | Best sellers | How they paid */}
      <div className="overview-mid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Pick-ups &amp; deliveries</h3>
              <p className="card-sub">{handedCount} of {todaysOrders.length} handed over today</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm" onClick={onOpenNewOrder}>+ Order</button>
              <button className="btn btn-sm" onClick={() => onNavigate('orders')}>Board ↗</button>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-surface-2)', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((handedCount / Math.max(todaysOrders.length, 1)) * 100)}%`, height: '100%', background: 'var(--green)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 230, overflowY: 'auto' }}>
            {todaysOrders.map((ord) => (
              <div key={ord.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                <span className="tabular" style={{ width: 40, color: 'var(--text-muted)' }}>{ord.due_time}</span>
                {ord.stage === 'Handed over' || ord.stage === 'Ready' ? (
                  <CheckCircle2 size={17} color="var(--green)" />
                ) : (
                  <Clock size={17} color="var(--amber)" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ord.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {ord.customer_name} · {ord.fulfillment} · {ord.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}
                  </div>
                </div>
                <span
                  className={`pill ${
                    ord.stage === 'Handed over' || ord.stage === 'Ready'
                      ? 'green'
                      : ord.stage === 'Arranging'
                        ? 'amber'
                        : 'blue'
                  }`}
                >
                  • {ord.stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Best sellers</h3>
              <p className="card-sub">Last 7 days</p>
            </div>
            <div className="segmented">
              <button className={bestMode === 'takings' ? 'active' : ''} onClick={() => setBestMode('takings')}>Takings</button>
              <button className={bestMode === 'units' ? 'active' : ''} onClick={() => setBestMode('units')}>Units</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bestSellers.map((b, i) => {
              const val = bestMode === 'takings' ? b.takings : b.units;
              const pct = Math.round((val / maxBest) * 100);
              return (
                <div key={b.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span>
                      <span className="kbd-pill" style={{ marginRight: 7 }}>{i + 1}</span>
                      <strong>{b.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>{b.category}</span>
                    </span>
                    <span className="tabular" style={{ fontWeight: 600 }}>
                      {bestMode === 'takings' ? formatMoneyWhole(b.takings) : `${b.units} sold`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-coral)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">How they paid</h3>
              <p className="card-sub">Today</p>
            </div>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
            {overview.payments_breakdown.map((pm) => (
              <div
                key={pm.method}
                style={{
                  width: `${Math.max(pm.pct, 2)}%`,
                  background: pmMeta[pm.method]?.color || 'var(--text-muted)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {overview.payments_breakdown.map((pm) => {
              const meta = pmMeta[pm.method] || { color: 'var(--text-muted)', icon: <CreditCard size={14} /> };
              return (
                <div key={pm.method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 96 }}>
                    <span className="icon-pill-soft" style={{ color: meta.color }}>
                      {meta.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{pm.method}</div>
                      <div className="tabular" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pm.pct}%</div>
                    </div>
                  </div>
                  <svg width="60" height="18" viewBox="0 0 60 18" fill="none">
                    <path
                      d={SPARKLINES[pm.method] || 'M 0 12 L 60 12'}
                      stroke={meta.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="tabular" style={{ fontWeight: 600, minWidth: 52, textAlign: 'right' }}>
                    {formatMoneyWhole(pm.amount_cents)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Row: Till feed | Use first */}
      <div className="overview-low">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Till feed</h3>
              <p className="card-sub">The last sales, as they ring up</p>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate('sales')}>All sales ↗</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.sales.slice(0, 6).map((s) => {
              const st = data.staff.find((x) => x.id === s.staff_id);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <span className="avatar-circle" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {st?.initials || 'MM'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.summary_text}
                    </div>
                    <div className="tabular" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.time_label} · {st?.name.split(' ')[0] || 'Staff'} · {s.shop_id === 'canal' ? 'Canal St' : 'Market Hall'}
                    </div>
                  </div>
                  <span className="tabular" style={{ fontWeight: 600 }}>{formatMoney(s.total_cents)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Use first</h3>
              <p className="card-sub">Stems by vase life left</p>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate('stock')}>Stems ↗</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.products
              .filter((p) => p.vase_life_days !== null)
              .sort((a, b) => (a.vase_life_days || 9) - (b.vase_life_days || 9))
              .slice(0, 5)
              .map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span className="kbd-pill tabular" style={{ fontWeight: 600 }}>{p.vase_life_days}d</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="tabular" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {p.stock_qty} stems {p.stock_qty < p.par_level ? '· below par' : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`pill ${(p.vase_life_days || 5) <= 2 ? 'amber' : 'green'}`}>
                    • {(p.vase_life_days || 5) <= 2 ? 'Soon' : 'Fresh'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Full-width Tills Row */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header" style={{ marginBottom: 4 }}>
          <div>
            <h3 className="card-title">Tills</h3>
            <p className="card-sub">Cash that should be in each drawer</p>
          </div>
          <button className="btn btn-sm" onClick={() => onNavigate('archive')}>Count &amp; close ↗</button>
        </div>
        <div className="tills-row">
          {data.tills.map((t) => {
            const st = data.staff.find((x) => x.id === t.staff_id);
            return (
              <div key={t.id} className="till-box">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="dot-green" />
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {st?.name.split(' ')[0]} · since {t.opened_at}
                  </div>
                </div>
                <div className="tabular" style={{ fontSize: 16, fontWeight: 700 }}>
                  {formatMoney(t.expected_cash_cents)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 4 }}>
        {rangeMode === 'today' ? 'Today' : rangeMode === 'week' ? 'This week' : 'This month'} · {formatMoneyWhole(overview.takings_cents)} across {overview.sales_count} sales
        {lastClose ? ` · Last day close ${lastClose.date_label} by ${lastClose.closed_by.split(' ')[0]}` : ''}
      </div>
    </div>
  );
};
