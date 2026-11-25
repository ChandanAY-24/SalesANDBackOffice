"""Pydantic schemas for Petalo API."""

from pydantic import BaseModel


class SaleItemIn(BaseModel):
    product_id: str | None = None
    name: str
    qty: int = 1
    unit_price_cents: int


class SaleCreate(BaseModel):
    shop_id: str
    till_id: str
    staff_id: str
    customer_id: str | None = None
    discount_type: str = "None"
    tip_cents: int = 0
    payment_method: str  # Card | Phone pay | Cash | Gift card
    cash_tendered_cents: int = 0
    items: list[SaleItemIn]


class OrderCreate(BaseModel):
    title: str
    customer_name: str
    customer_id: str | None = None
    shop_id: str = "canal"
    fulfillment: str = "Collect"
    stage: str = "New"
    due_time: str = "16:30"
    due_bucket: str = "Today"
    assigned_staff_id: str | None = None
    payment_status: str = "Paid"
    total_cents: int = 5800
    notes: str = ""


class OrderUpdate(BaseModel):
    stage: str | None = None
    position: int | None = None
    assigned_staff_id: str | None = None
    payment_status: str | None = None
    fulfillment: str | None = None
    due_time: str | None = None
    notes: str | None = None


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    price_cents: int
    unit_label: str = ""
    stock_qty: int = 10
    par_level: int = 10
    vase_life_days: int | None = None
    freshness_status: str = "Fresh"
    icon_key: str = "bouquet"
    shop_id: str = "all"


class ProductUpdate(BaseModel):
    stock_qty: int | None = None
    price_cents: int | None = None
    par_level: int | None = None
    vase_life_days: int | None = None
    freshness_status: str | None = None


class CustomerCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    tier: str = "Regular"
    notes: str = ""


class CustomerUpdate(BaseModel):
    tier: str | None = None
    notes: str | None = None
    phone: str | None = None
    email: str | None = None


class ShiftCreate(BaseModel):
    staff_id: str
    shop_id: str
    day_of_week: str
    start_time: str
    end_time: str
    role_label: str = "Florist"


class ShiftUpdate(BaseModel):
    day_of_week: str | None = None
    shop_id: str | None = None
    start_time: str | None = None
    end_time: str | None = None


class TillCloseIn(BaseModel):
    counted_cash_cents: int
    closed_by: str = "Ines Okafor"


class DayCloseCreate(BaseModel):
    shop_id: str
    closed_by: str = "Ines Okafor"
    cash_counted_cents: int


class SettingsUpdate(BaseModel):
    business_name: str | None = None
    tax_rate_pct: int | None = None
    receipt_footer: str | None = None
    tip_prompt_enabled: bool | None = None
    auto_lock_minutes: int | None = None
    theme: str | None = None
