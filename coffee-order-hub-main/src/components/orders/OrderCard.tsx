import type { Order } from "@/api/orderApi";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatPrice } from "@/utils/price";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/orders/${order.id}`)}
      className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/30 animate-fade-in"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-foreground">
            Order #{order.id.slice(0, 8)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
        <span className="font-semibold text-foreground">{formatPrice(order.total_cents)}</span>
      </div>
    </button>
  );
}
