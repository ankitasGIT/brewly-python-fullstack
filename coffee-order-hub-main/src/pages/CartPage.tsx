import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { CartItem } from "@/components/cart/CartItem";
import { formatPrice } from "@/utils/price";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { items, totalCents, clearCart } = useCartStore();
  const { mutate, isPending } = useCreateOrder();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    const total_cents = totalCents();
    const orderItems = items.map((item) => ({
      product_id: item.productId,
      variation_id: item.variationId,
      quantity: item.quantity,
    }));
    mutate(
      { items: orderItems, total_cents, metadata: {} },
      {
        onSuccess: (order) => {
          // Persist order ID so the orders page can fetch it
          try {
            const existing = JSON.parse(localStorage.getItem("brewly_order_ids") || "[]") as string[];
            if (!existing.includes(order.id)) {
              localStorage.setItem("brewly_order_ids", JSON.stringify([order.id, ...existing]));
            }
          } catch { /* ignore */ }
          clearCart();
          navigate(`/orders/${order.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <button onClick={() => navigate("/menu")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Menu
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Checkout</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
            <p>Your cart is empty</p>
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/menu")}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.variationId}`} item={item} />
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totalCents())}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-display text-lg font-bold">Total</span>
                <span className="font-display text-lg font-bold">{formatPrice(totalCents())}</span>
              </div>
              <Button className="w-full" size="lg" disabled={isPending} onClick={handlePlaceOrder}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Place Order
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
