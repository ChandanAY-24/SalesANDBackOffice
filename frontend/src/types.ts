export type NavRoute =
  | 'overview'
  | 'register'
  | 'orders'
  | 'sales'
  | 'customers'
  | 'insights'
  | 'payments'
  | 'stock'
  | 'team'
  | 'archive'
  | 'settings'
  | 'security'
  | 'help';

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  close_time: string;
  tax_rate_pct: number;
}

export interface Staff {
  id: string;
  name: string;
  initials: string;
  role: string;
  shop_id: string;
  pin: string;
  active_on_floor: boolean;
  avatar_color: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  unit_label: string;
  stock_qty: number;
  par_level: number;
  vase_life_days: number | null;
  freshness_status: string;
  icon_key: string;
  shop_id: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  notes: string;
  total_spent_cents: number;
  visits_count: number;
  created_at: string;
}

export interface Order {
  id: string;
  code: string;
  title: string;
  customer_id: string | null;
  customer_name: string;
  shop_id: string;
  fulfillment: 'Collect' | 'Delivery' | string;
  stage: 'New' | 'Arranging' | 'Ready' | 'Out for delivery' | 'Handed over' | string;
  due_time: string;
  due_bucket: string;
  assigned_staff_id: string | null;
  payment_status: 'Paid' | 'Unpaid' | string;
  total_cents: number;
  notes: string;
  position: number;
}

export interface Till {
  id: string;
  shop_id: string;
  label: string;
  staff_id: string;
  opened_at: string;
  opening_float_cents: number;
  expected_cash_cents: number;
  status: string;
}

export interface SaleItem {
  id?: number;
  product_id: string | null;
  name: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface Sale {
  id: string;
  receipt_no: string;
  shop_id: string;
  till_id: string;
  staff_id: string;
  customer_id: string | null;
  subtotal_cents: number;
  discount_type: string;
  discount_cents: number;
  tax_cents: number;
  tip_cents: number;
  total_cents: number;
  payment_method: string;
  cash_tendered_cents: number;
  change_cents: number;
  status: string;
  summary_text: string;
  time_label: string;
  hour_bucket: number;
  created_at: string;
  items: SaleItem[];
}

export interface Shift {
  id: string;
  staff_id: string;
  shop_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  role_label: string;
}

export interface DeliveryCheckIn {
  id: string;
  supplier: string;
  shop_id: string;
  items_summary: string;
  stem_count: number;
  status: string;
  eta: string;
}

export interface DayClose {
  id: string;
  shop_id: string;
  closed_by: string;
  date_label: string;
  total_sales_cents: number;
  cash_counted_cents: number;
  variance_cents: number;
  created_at: string;
}

export interface AppSettings {
  id: number;
  business_name: string;
  tax_rate_pct: number;
  receipt_footer: string;
  tip_prompt_enabled: boolean;
  auto_lock_minutes: number;
  theme: 'dark' | 'light';
}

export interface OverviewData {
  range: string;
  takings_cents: number;
  sales_count: number;
  average_basket_cents: number;
  refunds_cents: number;
  delta_pct: number;
  series: { label: string; current: number; previous: number }[];
  payments_breakdown: { method: string; amount_cents: number; pct: number }[];
}

export interface BootstrapPayload {
  shops: Shop[];
  staff: Staff[];
  products: Product[];
  orders: Order[];
  sales: Sale[];
  tills: Till[];
  customers: Customer[];
  shifts: Shift[];
  deliveries: DeliveryCheckIn[];
  day_closes: DayClose[];
  settings: AppSettings;
  overview: OverviewData;
}
