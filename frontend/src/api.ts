import { BootstrapPayload, Customer, Order, OverviewData, Product, Sale, Shift } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  bootstrap: (shop = 'all') => request<BootstrapPayload>(`/api/bootstrap?shop=${encodeURIComponent(shop)}`),
  overview: (shop = 'all', range = 'today') =>
    request<OverviewData>(`/api/overview?shop=${encodeURIComponent(shop)}&range=${encodeURIComponent(range)}`),
  createSale: (body: {
    shop_id: string;
    till_id: string;
    staff_id: string;
    customer_id: string | null;
    discount_type: string;
    tip_cents: number;
    payment_method: string;
    cash_tendered_cents: number;
    items: { product_id: string | null; name: string; qty: number; unit_price_cents: number }[];
  }) => request<Sale>('/api/sales', { method: 'POST', body: JSON.stringify(body) }),
  refundSale: (id: string) => request<Sale>(`/api/sales/${id}/refund`, { method: 'POST' }),
  createOrder: (body: Partial<Order>) => request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id: string, body: Partial<Order>) =>
    request<Order>(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createProduct: (body: Partial<Product>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  checkinDelivery: (id: string) => request(`/api/deliveries/${id}/checkin`, { method: 'POST' }),
  createCustomer: (body: Partial<Customer>) =>
    request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: Partial<Customer>) =>
    request<Customer>(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createShift: (body: Partial<Shift>) => request<Shift>('/api/shifts', { method: 'POST', body: JSON.stringify(body) }),
  updateShift: (id: string, body: Partial<Shift>) =>
    request<Shift>(`/api/shifts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  closeTill: (id: string, counted_cash_cents: number, closed_by: string) =>
    request(`/api/tills/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ counted_cash_cents, closed_by }),
    }),
  createDayClose: (shop_id: string, cash_counted_cents: number, closed_by: string) =>
    request('/api/day-closes', {
      method: 'POST',
      body: JSON.stringify({ shop_id, cash_counted_cents, closed_by }),
    }),
  updateSettings: (body: Record<string, unknown>) =>
    request('/api/settings', { method: 'PATCH', body: JSON.stringify(body) }),
};
