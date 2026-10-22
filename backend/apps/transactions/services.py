"""
Unified, read-only transaction history built on top of online orders and
POS sales. No models/migrations: each record is normalised on the fly, so the
payment fields can later be fed by a real Payment model without changing the API.
"""
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal

from django.db.models import Count, Q, Sum

from apps.orders.models import Order
from apps.pos.models import POSSale

ONLINE_ORDER = 'ONLINE_ORDER'
POS_SALE = 'POS_SALE'
PAY_AT_PICKUP = 'PAY_AT_PICKUP'
VOIDED = 'VOIDED'

ORDER_STATUSES = set(Order.Status.values)
VALID_STATUSES = ORDER_STATUSES | {VOIDED}
POS_METHODS = set(POSSale.PaymentMethod.values)
VALID_METHODS = POS_METHODS | {PAY_AT_PICKUP}

LOCAL_TZ = timezone(timedelta(hours=1))  # Nigeria (WAT), no daylight saving
MAX_LIMIT = 200


def money(value):
    return f"{Decimal(value or 0):.2f}"


def order_reference(order_id):
    return f"ORD-{order_id:06d}"


# ── Normalising ───────────────────────────────────────────────────────────────

def _order_payment_status(order):
    if order.status == Order.Status.COMPLETED:
        return 'PAID'
    if order.status in (Order.Status.REJECTED, Order.Status.CANCELLED):
        return 'NOT_REQUIRED'
    return 'UNPAID'


def serialize_order(order):
    paid = order.status == Order.Status.COMPLETED
    return {
        'key': f'order-{order.id}',
        'source': 'order',
        'source_id': order.id,
        'type': ONLINE_ORDER,
        'reference': order_reference(order.id),
        'status': order.status,
        'payment_method': PAY_AT_PICKUP,
        'payment_status': _order_payment_status(order),
        'total': money(order.total_price),
        'amount_paid': money(order.total_price) if paid else None,
        'change_given': None,
        'customer': order.user.email,
        'handled_by': None,
        'notes': order.notes,
        'items': [
            {
                'name': i.product_name,
                'quantity': i.quantity,
                'unit_price': money(i.price_snapshot),
                'subtotal': money(i.subtotal),
            }
            for i in order.items.all()
        ],
        'created_at': order.created_at,
    }


def serialize_sale(sale):
    return {
        'key': f'pos-{sale.id}',
        'source': 'pos',
        'source_id': sale.id,
        'type': POS_SALE,
        'reference': sale.receipt_number,
        'status': VOIDED if sale.is_voided else 'COMPLETED',
        'payment_method': sale.payment_method,
        'payment_status': VOIDED if sale.is_voided else 'PAID',
        'total': money(sale.total_amount),
        'amount_paid': money(sale.amount_paid),
        'change_given': money(sale.change_given),
        'customer': sale.customer_name or 'Walk-in',
        'handled_by': sale.cashier.email,
        'notes': sale.void_reason if sale.is_voided else '',
        'items': [
            {
                'name': i.product_name,
                'quantity': i.quantity,
                'unit_price': money(i.unit_price),
                'subtotal': money(i.subtotal),
            }
            for i in sale.items.all()
        ],
        'created_at': sale.created_at,
    }


# ── Filters ───────────────────────────────────────────────────────────────────

def _parse_date(params, name):
    raw = params.get(name)
    if not raw:
        return None
    try:
        return datetime.strptime(raw, '%Y-%m-%d').date()
    except ValueError:
        raise ValueError(f"'{name}' must be a date in YYYY-MM-DD format.")


def parse_filters(params):
    f = {}
    t = (params.get('type') or '').upper()
    if t:
        if t not in (ONLINE_ORDER, POS_SALE):
            raise ValueError("'type' must be ONLINE_ORDER or POS_SALE.")
        f['type'] = t
    s = (params.get('status') or '').upper()
    if s:
        if s not in VALID_STATUSES:
            raise ValueError(f"'status' must be one of: {', '.join(sorted(VALID_STATUSES))}.")
        f['status'] = s
    m = (params.get('payment_method') or '').upper()
    if m:
        if m not in VALID_METHODS:
            raise ValueError(f"'payment_method' must be one of: {', '.join(sorted(VALID_METHODS))}.")
        f['payment_method'] = m
    f['date_from'] = _parse_date(params, 'date_from')
    f['date_to'] = _parse_date(params, 'date_to')
    if f['date_from'] and f['date_to'] and f['date_from'] > f['date_to']:
        raise ValueError("'date_from' cannot be after 'date_to'.")
    f['q'] = (params.get('q') or '').strip()[:100]
    return f


def parse_paging(params, default=50):
    def to_int(name, fallback):
        try:
            return int(params.get(name, fallback))
        except (TypeError, ValueError):
            return fallback
    limit = min(max(to_int('limit', default), 1), MAX_LIMIT)
    offset = max(to_int('offset', 0), 0)
    return limit, offset


def build_querysets(f, only_user=None):
    """Return (orders, sales) querysets with the filters applied."""
    orders = Order.objects.all()
    sales = POSSale.objects.all()

    if only_user is not None:
        orders = orders.filter(user=only_user)
        sales = sales.none()

    if f.get('type') == POS_SALE:
        orders = orders.none()
    elif f.get('type') == ONLINE_ORDER:
        sales = sales.none()

    status = f.get('status')
    if status:
        orders = orders.filter(status=status) if status in ORDER_STATUSES else orders.none()
        if status == VOIDED:
            sales = sales.filter(is_voided=True)
        elif status == 'COMPLETED':
            sales = sales.filter(is_voided=False)
        else:
            sales = sales.none()

    method = f.get('payment_method')
    if method:
        if method == PAY_AT_PICKUP:
            sales = sales.none()
        else:
            orders = orders.none()
            sales = sales.filter(payment_method=method)

    if f.get('date_from'):
        start = datetime.combine(f['date_from'], time.min, tzinfo=LOCAL_TZ)
        orders = orders.filter(created_at__gte=start)
        sales = sales.filter(created_at__gte=start)
    if f.get('date_to'):
        end = datetime.combine(f['date_to'], time.max, tzinfo=LOCAL_TZ)
        orders = orders.filter(created_at__lte=end)
        sales = sales.filter(created_at__lte=end)

    q = f.get('q')
    if q:
        order_q = Q(user__email__icontains=q)
        digits = q.upper().replace('ORD-', '', 1) if q.upper().startswith('ORD-') else q
        if digits.isdigit():
            order_q |= Q(id=int(digits))
        orders = orders.filter(order_q)
        sales = sales.filter(
            Q(receipt_number__icontains=q)
            | Q(customer_name__icontains=q)
            | Q(cashier__email__icontains=q)
        )
    return orders, sales


# ── Pagination across two tables ──────────────────────────────────────────────

def get_page(orders, sales, limit, offset):
    """Newest first. Only the rows on the requested page are fully loaded."""
    keys = [(c, 'order', i) for c, i in orders.values_list('created_at', 'id')]
    keys += [(c, 'pos', i) for c, i in sales.values_list('created_at', 'id')]
    keys.sort(reverse=True)
    total = len(keys)
    window = keys[offset:offset + limit]

    order_ids = [i for _, s, i in window if s == 'order']
    sale_ids = [i for _, s, i in window if s == 'pos']
    order_map = {
        o.id: o for o in
        orders.model.objects.filter(id__in=order_ids)
        .select_related('user').prefetch_related('items')
    }
    sale_map = {
        s.id: s for s in
        sales.model.objects.filter(id__in=sale_ids)
        .select_related('cashier').prefetch_related('items')
    }
    records = []
    for _, source, pk in window:
        if source == 'order':
            records.append(serialize_order(order_map[pk]))
        else:
            records.append(serialize_sale(sale_map[pk]))
    return total, records


def summary(orders, sales):
    """Revenue counts COMPLETED online orders and non-voided POS sales."""
    done = orders.filter(status=Order.Status.COMPLETED).aggregate(
        total=Sum('total_price'), n=Count('id'))
    ok_sales = sales.filter(is_voided=False)
    pos = ok_sales.aggregate(total=Sum('total_amount'), n=Count('id'))
    by_method = {
        row['payment_method']: {'count': row['n'], 'total': money(row['total'])}
        for row in ok_sales.values('payment_method')
        .annotate(total=Sum('total_amount'), n=Count('id')).order_by()
    }
    revenue = (done['total'] or Decimal('0')) + (pos['total'] or Decimal('0'))
    return {
        'revenue': money(revenue),
        'online_orders': {'count': done['n'], 'total': money(done['total'])},
        'pos_sales': {'count': pos['n'], 'total': money(pos['total'])},
        'pos_by_payment_method': by_method,
        'voided_sales': sales.filter(is_voided=True).count(),
        'pending_orders': orders.filter(status=Order.Status.PENDING).count(),
        'rejected_or_cancelled_orders': orders.filter(
            status__in=[Order.Status.REJECTED, Order.Status.CANCELLED]).count(),
    }
