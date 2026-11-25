"""SQLAlchemy ORM models for Petalo POS & Back Office."""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Shop(Base):
    __tablename__ = "shops"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    address: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(40))
    close_time: Mapped[str] = mapped_column(String(16))
    tax_rate_pct: Mapped[int] = mapped_column(Integer, default=8)


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    initials: Mapped[str] = mapped_column(String(6))
    role: Mapped[str] = mapped_column(String(60))
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    pin: Mapped[str] = mapped_column(String(10), default="1234")
    active_on_floor: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_color: Mapped[str] = mapped_column(String(20), default="#f28571")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    sku: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(40))
    price_cents: Mapped[int] = mapped_column(Integer)
    unit_label: Mapped[str] = mapped_column(String(24), default="")
    stock_qty: Mapped[int] = mapped_column(Integer, default=0)
    par_level: Mapped[int] = mapped_column(Integer, default=10)
    vase_life_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    freshness_status: Mapped[str] = mapped_column(String(20), default="Fresh")
    icon_key: Mapped[str] = mapped_column(String(40), default="bouquet")
    shop_id: Mapped[str] = mapped_column(String(32), default="all")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(120), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    tier: Mapped[str] = mapped_column(String(24), default="Regular")
    notes: Mapped[str] = mapped_column(Text, default="")
    total_spent_cents: Mapped[int] = mapped_column(Integer, default=0)
    visits_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    code: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(140))
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    fulfillment: Mapped[str] = mapped_column(String(20))  # Collect | Delivery
    stage: Mapped[str] = mapped_column(String(32))  # New | Arranging | Ready | Out for delivery | Handed over
    due_time: Mapped[str] = mapped_column(String(16))  # e.g. "15:00"
    due_bucket: Mapped[str] = mapped_column(String(24), default="Today")  # Today | Tomorrow | This week
    assigned_staff_id: Mapped[str | None] = mapped_column(ForeignKey("staff.id"), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(20), default="Paid")  # Paid | Unpaid
    total_cents: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    position: Mapped[int] = mapped_column(Integer, default=0)


class Till(Base):
    __tablename__ = "tills"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    label: Mapped[str] = mapped_column(String(60))
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id"))
    opened_at: Mapped[str] = mapped_column(String(16), default="08:54")
    opening_float_cents: Mapped[int] = mapped_column(Integer, default=15000)
    expected_cash_cents: Mapped[int] = mapped_column(Integer, default=15000)
    status: Mapped[str] = mapped_column(String(20), default="Open")


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    receipt_no: Mapped[str] = mapped_column(String(24))
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    till_id: Mapped[str] = mapped_column(ForeignKey("tills.id"))
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id"))
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    subtotal_cents: Mapped[int] = mapped_column(Integer)
    discount_type: Mapped[str] = mapped_column(String(32), default="None")
    discount_cents: Mapped[int] = mapped_column(Integer, default=0)
    tax_cents: Mapped[int] = mapped_column(Integer, default=0)
    tip_cents: Mapped[int] = mapped_column(Integer, default=0)
    total_cents: Mapped[int] = mapped_column(Integer)
    payment_method: Mapped[str] = mapped_column(String(24))  # Card | Phone pay | Cash | Gift card
    cash_tendered_cents: Mapped[int] = mapped_column(Integer, default=0)
    change_cents: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="Completed")  # Completed | Refunded
    summary_text: Mapped[str] = mapped_column(String(200))
    time_label: Mapped[str] = mapped_column(String(16))
    hour_bucket: Mapped[int] = mapped_column(Integer, default=14)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem", back_populates="sale", cascade="all, delete-orphan"
    )


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sale_id: Mapped[str] = mapped_column(ForeignKey("sales.id"))
    product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120))
    qty: Mapped[int] = mapped_column(Integer, default=1)
    unit_price_cents: Mapped[int] = mapped_column(Integer)
    line_total_cents: Mapped[int] = mapped_column(Integer)

    sale: Mapped["Sale"] = relationship("Sale", back_populates="items")


class Shift(Base):
    __tablename__ = "shifts"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id"))
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    day_of_week: Mapped[str] = mapped_column(String(10))  # Mon..Sun
    start_time: Mapped[str] = mapped_column(String(10))
    end_time: Mapped[str] = mapped_column(String(10))
    role_label: Mapped[str] = mapped_column(String(40), default="Florist")


class DeliveryCheckIn(Base):
    __tablename__ = "deliveries"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    supplier: Mapped[str] = mapped_column(String(100))
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    items_summary: Mapped[str] = mapped_column(String(200))
    stem_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(24), default="Expected")  # Expected | Checked in
    eta: Mapped[str] = mapped_column(String(24), default="Today · 16:00")


class DayClose(Base):
    __tablename__ = "day_closes"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    closed_by: Mapped[str] = mapped_column(String(80))
    date_label: Mapped[str] = mapped_column(String(32))
    total_sales_cents: Mapped[int] = mapped_column(Integer, default=0)
    cash_counted_cents: Mapped[int] = mapped_column(Integer, default=0)
    variance_cents: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AppSettings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    business_name: Mapped[str] = mapped_column(String(100), default="Marigold & Moss")
    tax_rate_pct: Mapped[int] = mapped_column(Integer, default=8)
    receipt_footer: Mapped[str] = mapped_column(
        String(240),
        default="Keep the stems, fresh water every two days. Thank you for shopping small.",
    )
    tip_prompt_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_lock_minutes: Mapped[int] = mapped_column(Integer, default=15)
    theme: Mapped[str] = mapped_column(String(16), default="dark")
