"""Initial seed data for Petalo (Marigold & Moss two-shop florist)."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import (
    AppSettings,
    Customer,
    DayClose,
    DeliveryCheckIn,
    Order,
    Product,
    Sale,
    SaleItem,
    Shift,
    Shop,
    Staff,
    Till,
)


def seed_database(db: Session) -> None:
    """Populate database with Marigold & Moss sample data if empty."""
    if db.query(Shop).count() > 0:
        return

    shops = [
        Shop(
            id="canal",
            name="Canal St",
            address="Canal Street 184",
            phone="020 7946 0821",
            close_time="19:00",
            tax_rate_pct=8,
        ),
        Shop(
            id="market",
            name="Market Hall",
            address="Market Hall Stall 4",
            phone="020 7946 0822",
            close_time="17:00",
            tax_rate_pct=8,
        ),
    ]
    db.add_all(shops)

    staff = [
        Staff(id="st_ines", name="Ines Okafor", initials="IO", role="Shop manager", shop_id="canal", pin="1111", active_on_floor=True, avatar_color="#f28571"),
        Staff(id="st_jonah", name="Jonah Whitaker", initials="JW", role="Senior florist", shop_id="canal", pin="2222", active_on_floor=True, avatar_color="#63a4ff"),
        Staff(id="st_aisha", name="Aisha Jalloh", initials="AJ", role="Florist", shop_id="canal", pin="3333", active_on_floor=True, avatar_color="#34c77b"),
        Staff(id="st_rafael", name="Rafael Costa", initials="RE", role="Lead florist", shop_id="market", pin="4444", active_on_floor=True, avatar_color="#e5a93c"),
        Staff(id="st_mei", name="Mei Lin", initials="ML", role="Florist", shop_id="market", pin="5555", active_on_floor=True, avatar_color="#b98eff"),
        Staff(id="st_tara", name="Tara O'Connor", initials="TO", role="Junior florist", shop_id="canal", pin="6666", active_on_floor=True, avatar_color="#f472b6"),
        Staff(id="st_samir", name="Samir Patel", initials="SP", role="Courier", shop_id="market", pin="7777", active_on_floor=True, avatar_color="#38bdf8"),
    ]
    db.add_all(staff)

    products = [
        # Bouquets (7)
        Product(id="p_mkt_bunch", sku="BQ-001", name="Market bunch", category="Bouquets", price_cents=6800, stock_qty=12, par_level=8, icon_key="bunch"),
        Product(id="p_ht_small", sku="BQ-002", name="Hand-tie, small", category="Bouquets", price_cents=4800, stock_qty=11, par_level=8, icon_key="handtie"),
        Product(id="p_ht_med", sku="BQ-003", name="Hand-tie, medium", category="Bouquets", price_cents=8500, stock_qty=8, par_level=6, icon_key="handtie"),
        Product(id="p_ht_large", sku="BQ-004", name="Hand-tie, large", category="Bouquets", price_cents=12500, stock_qty=6, par_level=5, icon_key="bouquet"),
        Product(id="p_dahlia_tie", sku="BQ-005", name="Dahlia & rosehip tie", category="Bouquets", price_cents=5800, stock_qty=8, par_level=6, icon_key="dahlia"),
        Product(id="p_jam_jar", sku="BQ-006", name="Autumn jam jar", category="Bouquets", price_cents=1800, stock_qty=15, par_level=10, icon_key="jar"),
        Product(id="p_wreath", sku="BQ-007", name="Dried meadow wreath", category="Bouquets", price_cents=7200, stock_qty=5, par_level=4, icon_key="wreath"),
        # Single stems (10)
        Product(id="p_but_hole", sku="ST-001", name="Buttonhole", category="Single stems", price_cents=3000, stock_qty=9, par_level=6, vase_life_days=4, freshness_status="Fresh", icon_key="rose"),
        Product(id="p_dahlia_cal", sku="ST-002", name="Dahlia 'Cafe au Lait'", category="Single stems", price_cents=450, unit_label="/ stem", stock_qty=14, par_level=24, vase_life_days=2, freshness_status="Soon", icon_key="dahlia"),
        Product(id="p_juliet_rose", sku="ST-003", name="Garden rose 'Juliet'", category="Single stems", price_cents=520, unit_label="/ stem", stock_qty=38, par_level=30, vase_life_days=5, freshness_status="Fresh", icon_key="rose"),
        Product(id="p_chrys", sku="ST-004", name="Chrysanthemum", category="Single stems", price_cents=220, unit_label="/ stem", stock_qty=45, par_level=30, vase_life_days=7, freshness_status="Fresh", icon_key="daisy"),
        Product(id="p_euc", sku="ST-005", name="Eucalyptus cinerea", category="Single stems", price_cents=280, unit_label="/ stem", stock_qty=36, par_level=25, vase_life_days=8, freshness_status="Fresh", icon_key="leaf"),
        Product(id="p_ranunc", sku="ST-006", name="Ranunculus", category="Single stems", price_cents=380, unit_label="/ stem", stock_qty=12, par_level=30, vase_life_days=2, freshness_status="Soon", icon_key="dahlia"),
        Product(id="p_lisian", sku="ST-007", name="Lisianthus", category="Single stems", price_cents=390, unit_label="/ stem", stock_qty=40, par_level=25, vase_life_days=6, freshness_status="Fresh", icon_key="tulip"),
        Product(id="p_amaranth", sku="ST-008", name="Amaranthus", category="Single stems", price_cents=340, unit_label="/ stem", stock_qty=18, par_level=28, vase_life_days=4, freshness_status="Fresh", icon_key="fern"),
        Product(id="p_scabiosa", sku="ST-009", name="Scabiosa", category="Single stems", price_cents=320, unit_label="/ stem", stock_qty=11, par_level=24, vase_life_days=2, freshness_status="Soon", icon_key="daisy"),
        Product(id="p_hydrangea", sku="ST-010", name="Hydrangea", category="Single stems", price_cents=650, unit_label="/ stem", stock_qty=16, par_level=20, vase_life_days=5, freshness_status="Fresh", icon_key="bouquet"),
        # Plants (4)
        Product(id="p_olive", sku="PL-001", name="Olive tree, 1m", category="Plants", price_cents=12000, stock_qty=4, par_level=3, icon_key="plant"),
        Product(id="p_snake", sku="PL-002", name="Snake plant", category="Plants", price_cents=4200, stock_qty=9, par_level=6, icon_key="plant"),
        Product(id="p_monstera", sku="PL-003", name="Monstera, 18cm pot", category="Plants", price_cents=4800, stock_qty=7, par_level=5, icon_key="leaf"),
        Product(id="p_calathea", sku="PL-004", name="Calathea orbifolia", category="Plants", price_cents=3800, stock_qty=6, par_level=5, icon_key="leaf"),
        # Gifts & vases (3)
        Product(id="p_vase", sku="GV-001", name="Ribbed glass vase", category="Gifts & vases", price_cents=3800, stock_qty=14, par_level=8, icon_key="vase"),
        Product(id="p_card", sku="GV-002", name="Greeting card", category="Gifts & vases", price_cents=450, stock_qty=65, par_level=25, icon_key="card"),
        Product(id="p_snips", sku="GV-003", name="Brass stem snips", category="Gifts & vases", price_cents=2800, stock_qty=10, par_level=6, icon_key="snips"),
        # Workshops (2)
        Product(id="p_ws_wreath", sku="WS-001", name="Autumn wreath workshop", category="Workshops", price_cents=7500, stock_qty=8, par_level=4, icon_key="wreath"),
        Product(id="p_ws_tie", sku="WS-002", name="Hand-tie masterclass", category="Workshops", price_cents=6500, stock_qty=10, par_level=4, icon_key="bouquet"),
    ]
    db.add_all(products)

    customers = [
        Customer(id="c_sofia", name="Sofia Marchetti", email="sofia@marchetti.co", phone="07700 900112", tier="Regular", notes="Prefers muted terracotta & cream palettes", total_spent_cents=28400, visits_count=5),
        Customer(id="c_halden", name="Halden Hotel", email="concierge@haldenhotel.com", phone="020 7946 0400", tier="Corporate", notes="Weekly lobby refresh every Friday 11:00", total_spent_cents=184000, visits_count=14),
        Customer(id="c_ewa", name="Ewa Kowalska", email="ewa.k@gmail.com", phone="07700 900344", tier="VIP", notes="Loves Cafe au Lait dahlias", total_spent_cents=51200, visits_count=8),
        Customer(id="c_priya_n", name="Priya Nair", email="priya.nair@outlook.com", phone="07700 900519", tier="Regular", notes="Allergic to lilies", total_spent_cents=16400, visits_count=3),
        Customer(id="c_ibrahim", name="Ibrahim Saleh", email="ibrahim@salehstudio.uk", phone="07700 900682", tier="VIP", notes="Wrap in kraft + linen ribbon", total_spent_cents=43500, visits_count=6),
        Customer(id="c_arjun", name="Arjun Mehta", email="arjun.mehta@pm.me", phone="07700 900791", tier="Regular", notes="Usually collects after 17:00", total_spent_cents=9800, visits_count=2),
        Customer(id="c_lena", name="Lena Fischer", email="lena@fischer.de", phone="07700 900815", tier="VIP", notes="Dinner party centerpieces monthly", total_spent_cents=67000, visits_count=9),
        Customer(id="c_studio", name="Studio Pell", email="hello@studiopell.com", phone="020 7946 0990", tier="Corporate", notes="Invoice net 14 days", total_spent_cents=129000, visits_count=11),
    ]
    db.add_all(customers)

    tills = [
        Till(id="till_canal_1", shop_id="canal", label="Canal · Till 1", staff_id="st_jonah", opened_at="08:54", opening_float_cents=15000, expected_cash_cents=60933, status="Open"),
        Till(id="till_canal_2", shop_id="canal", label="Canal · Till 2", staff_id="st_aisha", opened_at="09:02", opening_float_cents=15000, expected_cash_cents=13726, status="Open"),
        Till(id="till_market_1", shop_id="market", label="Market · Till 1", staff_id="st_rafael", opened_at="08:45", opening_float_cents=15000, expected_cash_cents=17841, status="Open"),
    ]
    db.add_all(tills)

    orders = [
        # New (4)
        Order(id="ord_101", code="ORD-412", title="Thank-you bouquet", customer_id="c_ibrahim", customer_name="Ibrahim Saleh", shop_id="market", fulfillment="Delivery", stage="New", due_time="18:30", due_bucket="Today", assigned_staff_id="st_aisha", payment_status="Paid", total_cents=9000, notes="Leave with concierge if out", position=0),
        Order(id="ord_102", code="ORD-413", title="Date night jar", customer_id="c_arjun", customer_name="Arjun Mehta", shop_id="canal", fulfillment="Collect", stage="New", due_time="17:30", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Unpaid", total_cents=2300, notes="Warm coral tones", position=1),
        Order(id="ord_103", code="ORD-414", title="Dinner party table", customer_id="c_lena", customer_name="Lena Fischer", shop_id="canal", fulfillment="Collect", stage="New", due_time="18:00", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Paid", total_cents=6200, notes="Low arrangement for 8-seat table", position=2),
        Order(id="ord_104", code="ORD-415", title="Autumn wreath gift", customer_id="c_ewa", customer_name="Ewa Kowalska", shop_id="market", fulfillment="Collect", stage="New", due_time="11:00", due_bucket="Tomorrow", assigned_staff_id="st_mei", payment_status="Paid", total_cents=7200, notes="Include care card", position=3),
        # Arranging (4)
        Order(id="ord_105", code="ORD-408", title="Anniversary roses", customer_id="c_ewa", customer_name="Ewa Kowalska", shop_id="canal", fulfillment="Delivery", stage="Arranging", due_time="15:30", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Paid", total_cents=12500, notes="24 Juliet garden roses", position=0),
        Order(id="ord_106", code="ORD-409", title="Get-well posy", customer_id="c_priya_n", customer_name="Hannah Ruiz", shop_id="canal", fulfillment="Delivery", stage="Arranging", due_time="16:30", due_bucket="Today", assigned_staff_id="st_aisha", payment_status="Unpaid", total_cents=4800, notes="No lilies", position=1),
        Order(id="ord_107", code="ORD-410", title="Sympathy sheaf", customer_id=None, customer_name="Marcus Vance", shop_id="market", fulfillment="Delivery", stage="Arranging", due_time="16:45", due_bucket="Today", assigned_staff_id="st_rafael", payment_status="Paid", total_cents=9500, notes="White & eucalyptus", position=2),
        Order(id="ord_108", code="ORD-411", title="Studio welcome pot", customer_id="c_studio", customer_name="Studio Pell", shop_id="canal", fulfillment="Collect", stage="Arranging", due_time="10:30", due_bucket="Tomorrow", assigned_staff_id="st_tara", payment_status="Paid", total_cents=12000, notes="Olive tree 1m wrapped", position=3),
        # Ready (3)
        Order(id="ord_109", code="ORD-405", title="Dahlia tie for Mum", customer_id="c_priya_n", customer_name="Priya Nair", shop_id="canal", fulfillment="Collect", stage="Ready", due_time="15:00", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Paid", total_cents=5800, notes="Extra rosehips", position=0),
        Order(id="ord_110", code="ORD-406", title="Workshop pick-up", customer_id="c_priya_n", customer_name="Priya Raman", shop_id="market", fulfillment="Collect", stage="Ready", due_time="15:15", due_bucket="Today", assigned_staff_id="st_mei", payment_status="Paid", total_cents=7500, notes="Kit + snips", position=1),
        Order(id="ord_111", code="ORD-407", title="Terracotta market bunch", customer_id="c_sofia", customer_name="Sofia Marchetti", shop_id="canal", fulfillment="Collect", stage="Ready", due_time="17:00", due_bucket="Today", assigned_staff_id="st_aisha", payment_status="Paid", total_cents=6800, notes="", position=2),
        # Out for delivery (1)
        Order(id="ord_112", code="ORD-404", title="Reception arrangement", customer_id="c_studio", customer_name="Studio Pell", shop_id="canal", fulfillment="Delivery", stage="Out for delivery", due_time="15:45", due_bucket="Today", assigned_staff_id="st_samir", payment_status="Paid", total_cents=14500, notes="Front desk 3rd floor", position=0),
        # Handed over (6 -> total 18 orders)
        Order(id="ord_113", code="ORD-398", title="Café counter bunch", customer_id="c_sofia", customer_name="Sofia Marchetti", shop_id="market", fulfillment="Collect", stage="Handed over", due_time="09:30", due_bucket="Today", assigned_staff_id="st_rafael", payment_status="Paid", total_cents=6800, notes="", position=0),
        Order(id="ord_114", code="ORD-399", title="Halden lobby refresh", customer_id="c_halden", customer_name="Halden Hotel", shop_id="canal", fulfillment="Delivery", stage="Handed over", due_time="11:00", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Paid", total_cents=14500, notes="", position=1),
        Order(id="ord_115", code="ORD-400", title="Birthday hand-tie", customer_id="c_ewa", customer_name="Ewa Kowalska", shop_id="canal", fulfillment="Collect", stage="Handed over", due_time="12:30", due_bucket="Today", assigned_staff_id="st_aisha", payment_status="Paid", total_cents=8500, notes="", position=2),
        Order(id="ord_116", code="ORD-401", title="Gallery plinth vase", customer_id=None, customer_name="Kestrel Gallery", shop_id="canal", fulfillment="Delivery", stage="Handed over", due_time="13:15", due_bucket="Today", assigned_staff_id="st_jonah", payment_status="Paid", total_cents=11200, notes="", position=3),
        Order(id="ord_117", code="ORD-402", title="Weekend host posy", customer_id="c_lena", customer_name="Lena Fischer", shop_id="market", fulfillment="Collect", stage="Handed over", due_time="14:00", due_bucket="This week", assigned_staff_id="st_mei", payment_status="Paid", total_cents=4800, notes="", position=4),
        Order(id="ord_118", code="ORD-403", title="Olive tree delivery", customer_id="c_halden", customer_name="Halden Hotel", shop_id="canal", fulfillment="Delivery", stage="Handed over", due_time="10:15", due_bucket="This week", assigned_staff_id="st_samir", payment_status="Paid", total_cents=12000, notes="", position=5),
    ]
    db.add_all(orders)

    now = datetime.utcnow()
    # Seed recent sales totaling ~$3,322.30 across 51 sales (we store representative sales + hourly buckets)
    sample_sales = [
        ("s_51", "MM-1051", "market", "till_market_1", "st_mei", 1800, 144, 0, 1944, "Phone pay", "Autumn jam jar", "14:31", 14, ["Autumn jam jar"]),
        ("s_50", "MM-1050", "market", "till_market_1", "st_rafael", 10100, 808, 0, 10908, "Card", "Snake plant, Dried meadow wreath", "14:28", 14, ["Snake plant", "Dried meadow wreath"]),
        ("s_49", "MM-1049", "canal", "till_canal_1", "st_rafael", 8600, 688, 0, 9288, "Card", "Market bunch, Dahlia & rosehip tie", "14:24", 14, ["Market bunch", "Dahlia & rosehip tie"]),
        ("s_48", "MM-1048", "canal", "till_canal_2", "st_aisha", 5800, 464, 0, 6264, "Cash", "Dahlia & rosehip tie", "14:15", 14, ["Dahlia & rosehip tie"]),
        ("s_47", "MM-1047", "canal", "till_canal_1", "st_jonah", 3800, 304, 0, 4104, "Phone pay", "Ribbed glass vase", "14:12", 14, ["Ribbed glass vase"]),
        ("s_46", "MM-1046", "canal", "till_canal_2", "st_aisha", 3450, 276, 0, 3726, "Cash", "5 x Gypsophila, Greeting card, Amaranthus", "13:58", 13, ["Greeting card", "Amaranthus"]),
        ("s_45", "MM-1045", "canal", "till_canal_1", "st_jonah", 12500, 1000, 1500, 15000, "Card", "Hand-tie, large", "13:42", 13, ["Hand-tie, large"]),
        ("s_44", "MM-1044", "market", "till_market_1", "st_rafael", 8500, 680, 0, 9180, "Card", "Hand-tie, medium", "13:18", 13, ["Hand-tie, medium"]),
        ("s_43", "MM-1043", "canal", "till_canal_1", "st_jonah", 12000, 960, 0, 12960, "Phone pay", "Olive tree, 1m", "12:50", 12, ["Olive tree, 1m"]),
        ("s_42", "MM-1042", "canal", "till_canal_2", "st_aisha", 14400, 1152, 0, 15552, "Card", "Hand-tie, large, Greeting card", "12:22", 12, ["Hand-tie, large"]),
        ("s_41", "MM-1041", "market", "till_market_1", "st_mei", 6800, 544, 0, 7344, "Cash", "Market bunch", "11:48", 11, ["Market bunch"]),
        ("s_40", "MM-1040", "canal", "till_canal_1", "st_jonah", 17000, 1360, 1000, 19360, "Card", "2 x Hand-tie, medium", "11:15", 11, ["Hand-tie, medium"]),
        ("s_39", "MM-1039", "canal", "till_canal_1", "st_jonah", 9600, 768, 0, 10368, "Phone pay", "2 x Hand-tie, small", "10:40", 10, ["Hand-tie, small"]),
        ("s_38", "MM-1038", "market", "till_market_1", "st_rafael", 7200, 576, 0, 7776, "Cash", "Dried meadow wreath", "09:55", 9, ["Dried meadow wreath"]),
        ("s_37", "MM-1037", "canal", "till_canal_1", "st_jonah", 6800, 544, 0, 7344, "Card", "Market bunch", "08:59", 8, ["Market bunch"]),
    ]

    for idx, (sid, rno, sh_id, tid, st_id, sub, tax, tip, tot, pm, summ, tlbl, hr, inames) in enumerate(sample_sales):
        s = Sale(
            id=sid,
            receipt_no=rno,
            shop_id=sh_id,
            till_id=tid,
            staff_id=st_id,
            subtotal_cents=sub,
            discount_type="None",
            discount_cents=0,
            tax_cents=tax,
            tip_cents=tip,
            total_cents=tot,
            payment_method=pm,
            summary_text=summ,
            time_label=tlbl,
            hour_bucket=hr,
            created_at=now - timedelta(minutes=idx * 18),
        )
        db.add(s)
        for nm in inames:
            db.add(SaleItem(sale_id=sid, name=nm, qty=1, unit_price_cents=sub // len(inames), line_total_cents=sub // len(inames)))

    shifts = [
        Shift(id="sh_1", staff_id="st_ines", shop_id="canal", day_of_week="Fri", start_time="08:30", end_time="17:00", role_label="Manager"),
        Shift(id="sh_2", staff_id="st_jonah", shop_id="canal", day_of_week="Fri", start_time="08:45", end_time="17:30", role_label="Till 1 & Bench"),
        Shift(id="sh_3", staff_id="st_aisha", shop_id="canal", day_of_week="Fri", start_time="09:00", end_time="18:00", role_label="Till 2 & Bench"),
        Shift(id="sh_4", staff_id="st_rafael", shop_id="market", day_of_week="Fri", start_time="08:30", end_time="17:00", role_label="Lead & Till 1"),
        Shift(id="sh_5", staff_id="st_mei", shop_id="market", day_of_week="Fri", start_time="09:30", end_time="17:00", role_label="Bench"),
        Shift(id="sh_6", staff_id="st_tara", shop_id="canal", day_of_week="Sat", start_time="09:00", end_time="18:00", role_label="Counter"),
        Shift(id="sh_7", staff_id="st_samir", shop_id="canal", day_of_week="Fri", start_time="10:00", end_time="18:30", role_label="Deliveries"),
        Shift(id="sh_8", staff_id="st_jonah", shop_id="canal", day_of_week="Mon", start_time="08:45", end_time="17:00", role_label="Bench"),
        Shift(id="sh_9", staff_id="st_aisha", shop_id="canal", day_of_week="Tue", start_time="09:00", end_time="17:30", role_label="Counter"),
        Shift(id="sh_10", staff_id="st_rafael", shop_id="market", day_of_week="Wed", start_time="08:30", end_time="17:00", role_label="Lead"),
        Shift(id="sh_11", staff_id="st_mei", shop_id="market", day_of_week="Thu", start_time="09:00", end_time="17:00", role_label="Bench"),
    ]
    db.add_all(shifts)

    deliveries = [
        DeliveryCheckIn(id="del_1", supplier="Aalsmeer Direct", shop_id="canal", items_summary="40x Ranunculus, 30x Dahlia 'Cafe au Lait', 20x Eucalyptus", stem_count=90, status="Expected", eta="Today · 16:00"),
        DeliveryCheckIn(id="del_2", supplier="Kentish Garden Growers", shop_id="market", items_summary="25x Garden rose 'Juliet', 30x Scabiosa, 15x Hydrangea", stem_count=70, status="Expected", eta="Tomorrow · 07:30"),
        DeliveryCheckIn(id="del_3", supplier="Cornwall Foliage Co.", shop_id="canal", items_summary="50x Eucalyptus cinerea, 20x Amaranthus", stem_count=70, status="Checked in", eta="Today · 07:15"),
    ]
    db.add_all(deliveries)

    day_closes = [
        DayClose(id="dc_1", shop_id="canal", closed_by="Rafael Costa", date_label="Thu 22 Oct", total_sales_cents=298450, cash_counted_cents=51200, variance_cents=0),
        DayClose(id="dc_2", shop_id="market", closed_by="Ines Okafor", date_label="Thu 22 Oct", total_sales_cents=164200, cash_counted_cents=28950, variance_cents=-150),
        DayClose(id="dc_3", shop_id="canal", closed_by="Ines Okafor", date_label="Wed 21 Oct", total_sales_cents=241100, cash_counted_cents=43000, variance_cents=0),
    ]
    db.add_all(day_closes)

    db.add(AppSettings(id=1))
    db.commit()
