import { useOrder } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Package } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import type { Order } from "@/api/orderApi";

/**
 * The backend has no GET /orders list endpoint for customers.
 * We store order IDs in localStorage after placing them, and fetch each individually.
 */
const STORAGE_KEY = "brewly_order_ids";

export function useStoredOrderIds(): [string[], (id: string) => void] {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const addId = (id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [id, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return [ids, addId];
}

function OrderEntry({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useOrder(orderId);
  if (isLoading) return <div className="h-20 rounded-lg border border-border animate-pulse bg-muted/40" />;
  if (isError || !order) return null;
  return <OrderCard order={order} />;
}

const OrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [orderIds] = useStoredOrderIds();

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">My Orders</h1>

        {orderIds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p>No orders yet</p>
          </div>
        )}

        {orderIds.length > 0 && (
          <div className="space-y-3">
            {orderIds.map((id) => (
              <OrderEntry key={id} orderId={id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
