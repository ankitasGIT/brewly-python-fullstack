import type { Order } from "@/api/orderApi";
import { OrderStatusBadge } from "../orders/OrderStatusBadge";
import { formatPrice } from "@/utils/price";
import { ORDER_STATUSES, type OrderStatus } from "@/utils/constants";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function ManagerOrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { mutate, isPending } = useUpdateOrderStatus();
  const currentIdx = ORDER_STATUSES.indexOf(order.status);
  const nextStatus = currentIdx < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[currentIdx + 1] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2 animate-scale-in">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm text-foreground truncate">#{order.id.slice(0, 8)}</p>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatPrice(order.total_cents)} · {order.items.length} items
      </p>

      {expanded && (
        <div className="space-y-1 border-t border-border pt-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs text-muted-foreground">
              <span>{item.product_name} ({item.variation_name}) ×{item.quantity}</span>
              <span>{formatPrice(item.line_total_cents)}</span>
            </div>
          ))}
          {order.payment && (
            <div className="flex justify-between text-xs pt-1 border-t border-border text-muted-foreground">
              <span>Payment</span>
              <span className={order.payment.response_status_code === 200 ? "text-green-600" : "text-destructive"}>
                {order.payment.response_status_code === 200 ? "Paid" : `Failed (${order.payment.response_status_code})`}
              </span>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </p>

      {nextStatus && (
        <Button
          size="sm"
          className="w-full gap-1 text-xs"
          disabled={isPending}
          onClick={() => mutate({ orderId: order.id, status: nextStatus })}
        >
          Move to {nextStatus} <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface Props {
  orders: Order[];
}

export function OrderBoard({ orders }: Props) {
  const columns: { status: OrderStatus; label: string }[] = [
    { status: "waiting", label: "🕐 Waiting" },
    { status: "preparation", label: "👨‍🍳 Preparation" },
    { status: "ready", label: "✅ Ready" },
    { status: "delivered", label: "📦 Delivered" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columns.map(({ status, label }) => {
        const columnOrders = orders.filter((o) => o.status === status);
        return (
          <div key={status} className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">{label}</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {columnOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {columnOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No orders</p>
              ) : (
                columnOrders.map((order) => <ManagerOrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
