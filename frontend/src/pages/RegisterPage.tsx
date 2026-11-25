import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  CreditCard,
  Gift,
  Mail,
  Minus,
  Plus,
  Printer,
  Search,
  Smartphone,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { api } from '../api';
import { BootstrapPayload, Product, Sale } from '../types';
import { BotanicalIcon } from '../ui/BotanicalIcons';
import { formatMoney } from '../ui/format';

interface CartLine {
  product_id: string | null;
  name: string;
  unit_price_cents: number;
  qty: number;
}

interface RegisterPageProps {
  data: BootstrapPayload;
  onSaleCompleted: () => Promise<void>;
  onToast: (msg: string) => void;
}

const CATEGORIES = ['Everything', 'Bouquets', 'Single stems', 'Plants', 'Gifts & vases', 'Workshops'];

export const RegisterPage: React.FC<RegisterPageProps> = ({ data, onSaleCompleted, onToast }) => {
  const [activeTillId, setActiveTillId] = useState(data.tills[0]?.id || 'till_canal_1');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Everything');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountType, setDiscountType] = useState<'None' | 'Regular 10%' | 'Staff 20%'>('None');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customModal, setCustomModal] = useState(false);
  const [customName, setCustomName] = useState('Bespoke stem bundle');
  const [customPrice, setCustomPrice] = useState('25.00');

  const [checkoutStep, setCheckoutStep] = useState<null | 'method' | 'tip' | 'cash' | 'tap' | 'approving' | 'receipt'>(null);
  const [payMethod, setPayMethod] = useState<'Card' | 'Phone pay' | 'Cash' | 'Gift card'>('Card');
  const [tipCents, setTipCents] = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const activeTill = data.tills.find((t) => t.id === activeTillId) || data.tills.find((t) => t.status === 'Open') || data.tills[0];
  const tillClosed = activeTill?.status !== 'Open';
  const tillStaff = data.staff.find((s) => s.id === activeTill?.staff_id);
  const attachedCustomer = data.customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (!data.tills.some((t) => t.id === activeTillId)) {
      const nextOpen = data.tills.find((t) => t.status === 'Open') || data.tills[0];
      if (nextOpen) setActiveTillId(nextOpen.id);
    }
  }, [data.tills, activeTillId]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.products.filter((p) => {
      const catOk = category === 'Everything' || p.category === category;
      const qOk = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [data.products, category, search]);

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { Everything: data.products.length };
    for (const p of data.products) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [data.products]);

  const subtotalCents = cart.reduce((acc, l) => acc + l.unit_price_cents * l.qty, 0);
  const discountPct = discountType === 'Regular 10%' ? 0.1 : discountType === 'Staff 20%' ? 0.2 : 0;
  const discountCents = Math.round(subtotalCents * discountPct);
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxRate = (data.settings.tax_rate_pct || 8) / 100;
  const taxCents = Math.round(taxableCents * taxRate);
  const totalBeforeTip = taxableCents + taxCents;

  const addProduct = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product_id === p.id);
      if (existing) {
        return prev.map((l) => (l.product_id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product_id: p.id, name: p.name, unit_price_cents: p.price_cents, qty: 1 }];
    });
  };

  const updateQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l, i) => (i === idx ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const removeLine = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const finalizeSale = async (method: string, tip: number, cashCents: number) => {
    setCheckoutStep('approving');
    try {
      const sale = await api.createSale({
        shop_id: activeTill?.shop_id || 'canal',
        till_id: activeTill?.id || 'till_canal_1',
        staff_id: activeTill?.staff_id || 'st_jonah',
        customer_id: customerId,
        discount_type: discountType,
        tip_cents: tip,
        payment_method: method,
        cash_tendered_cents: cashCents,
        items: cart,
      });
      await new Promise((r) => setTimeout(r, 650));
      setCompletedSale(sale);
      setCheckoutStep('receipt');
      setCart([]);
      setCustomerId(null);
      setDiscountType('None');
      await onSaleCompleted();
    } catch (err) {
      setCheckoutStep('method');
      onToast(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h1 className="page-title">Register</h1>
          <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dot-green" style={{ background: tillClosed ? 'var(--red)' : 'var(--green)' }} />
            {activeTill?.label} ({activeTill?.status}) · {tillStaff?.name || 'Jonah Whitaker'}
          </p>
        </div>
        <div className="segmented">
          {data.tills.map((t) => (
            <button
              key={t.id}
              className={activeTillId === t.id ? 'active' : ''}
              onClick={() => setActiveTillId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="register-layout">
        <div className="register-catalog">
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="search-field" style={{ flex: 1 }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a product or SKU"
              />
            </div>
            <button className="btn" onClick={() => setCustomModal(true)}>
              <Plus size={15} />
              <span>Custom amount</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="btn btn-sm"
                  style={
                    active
                      ? { background: 'var(--text-primary)', color: 'var(--bg-app)', borderColor: 'var(--text-primary)', fontWeight: 600 }
                      : undefined
                  }
                >
                  <span>{c}</span>
                  <span className="tabular" style={{ opacity: 0.7 }}>{catCounts[c] || 0}</span>
                </button>
              );
            })}
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => {
              const inCart = cart.find((l) => l.product_id === p.id);
              return (
                <button
                  key={p.id}
                  className={`product-tile ${inCart ? 'selected' : ''}`}
                  onClick={() => addProduct(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <span style={{ color: inCart ? 'var(--accent-coral)' : 'var(--text-secondary)' }}>
                      <BotanicalIcon kind={p.icon_key} size={34} />
                    </span>
                    {inCart && (
                      <span className="pill coral tabular" style={{ fontSize: 11 }}>{inCart.qty}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ marginTop: 'auto', width: '100%' }}>
                    <div className="tabular" style={{ fontSize: 13.5, fontWeight: 700 }}>
                      {formatMoney(p.price_cents)}{' '}
                      {p.unit_label && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>{p.unit_label}</span>}
                    </div>
                    <div className="tabular" style={{ fontSize: 11, color: p.stock_qty <= 5 ? 'var(--amber)' : 'var(--text-muted)' }}>
                      {p.stock_qty} left
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Current Sale Cart (2-row line items matching 00:09–00:12) */}
        <div className="cart-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 15 }}>Current sale</strong>
              <span className="nav-badge tabular">{cart.reduce((a, b) => a + b.qty, 0)}</span>
            </div>
            {cart.length > 0 && (
              <button className="icon-btn" onClick={() => setCart([])} title="Clear sale">
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <select
              className="pill-select"
              style={{ width: '100%', height: 34 }}
              value={customerId || ''}
              onChange={(e) => setCustomerId(e.target.value || null)}
            >
              <option value="">+ Attach a customer</option>
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
            {attachedCustomer && (
              <div style={{ fontSize: 11, color: 'var(--accent-coral)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserPlus size={12} /> {attachedCustomer.name} · {attachedCustomer.notes || attachedCustomer.tier}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nothing on this sale yet</div>
                <div style={{ fontSize: 12 }}>Tap a product to add, or ring in a price.</div>
              </div>
            ) : (
              cart.map((line, idx) => (
                <div
                  key={`${line.name}-${idx}`}
                  style={{
                    padding: '9px 2px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{line.name}</span>
                    <span className="tabular" style={{ fontSize: 13, fontWeight: 700 }}>
                      {formatMoney(line.unit_price_cents * line.qty)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => updateQty(idx, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="tabular" style={{ minWidth: 18, textAlign: 'center', fontSize: 12.5, fontWeight: 600 }}>
                        {line.qty}
                      </span>
                      <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => updateQty(idx, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => removeLine(idx)} title="Remove">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Discount</span>
              <div className="segmented">
                {(['None', 'Regular 10%', 'Staff 20%'] as const).map((d) => (
                  <button
                    key={d}
                    className={discountType === d ? 'active' : ''}
                    onClick={() => setDiscountType(d)}
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Subtotal</span>
              <span className="tabular">{formatMoney(subtotalCents)}</span>
            </div>
            {discountCents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--green)', marginBottom: 4 }}>
                <span>Discount ({discountType})</span>
                <span className="tabular">-{formatMoney(discountCents)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Tax {data.settings.tax_rate_pct || 8}%</span>
              <span className="tabular">{formatMoney(taxCents)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <strong style={{ fontSize: 15 }}>Total</strong>
              <strong className="tabular" style={{ fontSize: 22 }}>{formatMoney(totalBeforeTip)}</strong>
            </div>

            <button
              className="btn btn-primary"
              disabled={cart.length === 0 || tillClosed}
              onClick={() => {
                setTipCents(0);
                setCashTendered((totalBeforeTip / 100).toFixed(2));
                setCheckoutStep('method');
              }}
              style={{ width: '100%', height: 42, borderRadius: 12, justifyContent: 'center', fontSize: 14, opacity: cart.length === 0 || tillClosed ? 0.45 : 1 }}
            >
              {tillClosed ? 'Till is closed' : `Charge ${formatMoney(totalBeforeTip)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Amount Modal */}
      {customModal && (
        <div className="modal-backdrop" onClick={() => setCustomModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong>Custom amount</strong>
              <button className="icon-btn" onClick={() => setCustomModal(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Description"
                className="pill-select"
                style={{ borderRadius: 10, height: 38 }}
              />
              <input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Price ($)"
                className="pill-select tabular"
                style={{ borderRadius: 10, height: 38 }}
              />
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', height: 38 }}
                onClick={() => {
                  const cents = Math.round(parseFloat(customPrice || '0') * 100);
                  if (cents > 0) {
                    setCart((prev) => [...prev, { product_id: null, name: customName || 'Custom item', unit_price_cents: cents, qty: 1 }]);
                    setCustomModal(false);
                  }
                }}
              >
                Add to sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Checkout Modal */}
      {checkoutStep && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {activeTill?.label} · {attachedCustomer ? attachedCustomer.name : 'Walk-in'}
              </span>
              <button className="icon-btn" onClick={() => setCheckoutStep(null)}><X size={16} /></button>
            </div>

            {checkoutStep === 'method' && (
              <div>
                <h2 style={{ margin: '0 0 16px', fontSize: 22 }} className="tabular">
                  Charge {formatMoney(totalBeforeTip)}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { id: 'Card' as const, sub: 'Tap, insert or swipe', icon: <CreditCard size={18} /> },
                    { id: 'Phone pay' as const, sub: 'Phone or watch', icon: <Smartphone size={18} /> },
                    { id: 'Cash' as const, sub: 'Notes, coins and change', icon: <Banknote size={18} /> },
                    { id: 'Gift card' as const, sub: 'Marigold & Moss card', icon: <Gift size={18} /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      className="product-tile"
                      style={{ padding: 14 }}
                      onClick={() => {
                        setPayMethod(m.id);
                        if (m.id === 'Cash') setCheckoutStep('cash');
                        else if (data.settings.tip_prompt_enabled) setCheckoutStep('tip');
                        else setCheckoutStep('tap');
                      }}
                    >
                      <span className="icon-pill-soft" style={{ width: 32, height: 32, color: 'var(--accent-coral)' }}>{m.icon}</span>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.id}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {checkoutStep === 'tip' && (
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 20 }} className="tabular">
                  Charge {formatMoney(totalBeforeTip)}
                </h2>
                <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Turn the screen round: &ldquo;Would you like to add a tip for the florist?&rdquo;
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'No tip', sub: 'Thank you', cents: 0 },
                    { label: '10%', sub: formatMoney(Math.round(totalBeforeTip * 0.1)), cents: Math.round(totalBeforeTip * 0.1) },
                    { label: '15%', sub: formatMoney(Math.round(totalBeforeTip * 0.15)), cents: Math.round(totalBeforeTip * 0.15) },
                    { label: '20%', sub: formatMoney(Math.round(totalBeforeTip * 0.2)), cents: Math.round(totalBeforeTip * 0.2) },
                  ].map((t) => (
                    <button
                      key={t.label}
                      className="product-tile"
                      style={{ alignItems: 'center', textAlign: 'center', padding: 16 }}
                      onClick={() => {
                        setTipCents(t.cents);
                        if (payMethod === 'Card' || payMethod === 'Phone pay') setCheckoutStep('tap');
                        else finalizeSale(payMethod, t.cents, 0);
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{t.label}</div>
                      <div className="tabular" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {checkoutStep === 'cash' && (() => {
              const cashCents = Math.round(parseFloat(cashTendered || '0') * 100);
              const insufficient = Number.isNaN(cashCents) || cashCents < totalBeforeTip;
              return (
                <div>
                  <h2 style={{ margin: '0 0 10px', fontSize: 20 }} className="tabular">
                    Cash due: {formatMoney(totalBeforeTip)}
                  </h2>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Cash tendered ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="pill-select tabular"
                    style={{ width: '100%', height: 42, borderRadius: 10, fontSize: 18, marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[20, 50, 100, 150].map((note) => (
                      <button key={note} className="btn btn-sm" onClick={() => setCashTendered(String(note))}>
                        ${note}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
                    <span>{insufficient ? 'Shortfall' : 'Change due'}</span>
                    <strong className="tabular" style={{ color: insufficient ? 'var(--red)' : 'var(--green)' }}>
                      {insufficient ? `-${formatMoney(totalBeforeTip - Math.max(0, cashCents))}` : formatMoney(cashCents - totalBeforeTip)}
                    </strong>
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={insufficient}
                    style={{ width: '100%', height: 40, justifyContent: 'center', opacity: insufficient ? 0.45 : 1 }}
                    onClick={() => finalizeSale('Cash', 0, cashCents)}
                  >
                    {insufficient ? 'Insufficient cash' : 'Complete cash sale'}
                  </button>
                </div>
              );
            })()}

            {checkoutStep === 'tap' && (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: 22 }} className="tabular">
                  Charge {formatMoney(totalBeforeTip + tipCents)}
                </h2>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: 'var(--accent-coral-soft)',
                    color: 'var(--accent-coral)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  {payMethod === 'Phone pay' ? <Smartphone size={30} /> : payMethod === 'Gift card' ? <Gift size={30} /> : <CreditCard size={30} />}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 18 }}>
                  {payMethod === 'Phone pay'
                    ? 'Hold phone or watch near the reader'
                    : payMethod === 'Gift card'
                      ? 'Scan or enter Marigold & Moss gift card'
                      : 'Tap, insert or swipe the card'}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ height: 40, padding: '0 22px' }}
                  onClick={() => finalizeSale(payMethod, tipCents, 0)}
                >
                  <Check size={16} />
                  <span>{payMethod === 'Gift card' ? 'Redeem gift card' : `${payMethod} tapped`}</span>
                </button>
              </div>
            )}

            {checkoutStep === 'approving' && (
              <div style={{ textAlign: 'center', padding: '32px 12px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: 20 }}>Approving...</h2>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    border: '4px solid var(--border-subtle)',
                    borderTopColor: 'var(--accent-coral)',
                    margin: '0 auto 14px',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Talking to the bank...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {checkoutStep === 'receipt' && completedSale && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background: 'var(--green-soft)',
                      color: 'var(--green)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Check size={18} />
                  </div>
                  <div>
                    <div className="tabular" style={{ fontSize: 20, fontWeight: 700 }}>
                      {formatMoney(completedSale.total_cents)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Approved · {completedSale.payment_method}
                    </div>
                  </div>
                </div>

                <div className="receipt-paper">
                  <div className="paid-stamp">PAID</div>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <strong style={{ fontSize: 15 }}>{data.settings.business_name || 'Marigold & Moss'}</strong>
                    <div style={{ fontSize: 11, color: '#6b665f' }}>
                      {(() => {
                        const sh = data.shops.find((s) => s.id === completedSale.shop_id);
                        return sh ? `${sh.address} · ${sh.phone}` : 'Canal Street 184 · 020 7946 0821';
                      })()}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b665f' }}>
                      {completedSale.receipt_no} · Fri 23 Oct · {completedSale.time_label}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px dashed #d5d0c8', borderBottom: '1px dashed #d5d0c8', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {completedSale.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{it.qty > 1 ? `${it.qty} × ` : ''}{it.name}</span>
                        <span className="tabular">{formatMoney(it.line_total_cents)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c5852' }}>
                      <span>Subtotal</span>
                      <span className="tabular">{formatMoney(completedSale.subtotal_cents)}</span>
                    </div>
                    {completedSale.discount_cents > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1b6b44' }}>
                        <span>Discount ({completedSale.discount_type})</span>
                        <span className="tabular">-{formatMoney(completedSale.discount_cents)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c5852' }}>
                      <span>Tax {data.settings.tax_rate_pct || 8}%</span>
                      <span className="tabular">{formatMoney(completedSale.tax_cents)}</span>
                    </div>
                    {completedSale.tip_cents > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c5852' }}>
                        <span>Tip</span>
                        <span className="tabular">{formatMoney(completedSale.tip_cents)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                      <span>Total</span>
                      <span className="tabular">{formatMoney(completedSale.total_cents)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#6b665f' }}>
                    <div>{completedSale.payment_method} · served by {tillStaff?.name.split(' ')[0] || 'Jonah'}</div>
                    <div style={{ marginTop: 3 }}>{data.settings.receipt_footer}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn" onClick={() => window.print()}>
                    <Printer size={14} /> Print
                  </button>
                  <button className="btn" onClick={() => onToast('Receipt emailed to customer')}>
                    <Mail size={14} /> Email
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setCheckoutStep(null)}
                  >
                    + New sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
