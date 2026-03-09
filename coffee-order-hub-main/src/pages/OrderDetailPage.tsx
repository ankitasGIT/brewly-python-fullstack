import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatPrice } from "@/utils/price";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, AlertCircle, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useOrder(id || "");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["orders", id] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <button onClick={() => navigate("/orders")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
            <p>Failed to load order details.</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh status">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <h2 className="font-display font-semibold">Items</h2>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variation_name} × {item.quantity} · {formatPrice(item.unit_price_cents)} each
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(item.line_total_cents)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-4 flex justify-between">
                <span className="font-display font-bold">Total</span>
                <span className="font-display font-bold">{formatPrice(order.total_cents)}</span>
              </div>
            </div>

            {/* Payment */}
            {order.payment && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-display font-semibold">Payment</h2>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{formatPrice(order.payment.amount_cents)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={order.payment.response_status_code === 200 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                    {order.payment.response_status_code === 200 ? "Paid" : `Failed (${order.payment.response_status_code})`}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.metadata && Object.keys(order.metadata).length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="font-display font-semibold mb-2">Notes</h2>
                <p className="text-sm text-muted-foreground">
                  {String(order.metadata.notes || JSON.stringify(order.metadata))}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderDetailPage;
