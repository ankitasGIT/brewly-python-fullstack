import { useCartStore } from "@/store/cartStore";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/utils/price";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CartSidebar() {
  const { items, isOpen, setCartOpen, totalCents, totalItems } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Your Cart</h2>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {totalItems()}
            </span>
          </div>
          <button onClick={() => setCartOpen(false)} className="rounded-md p-1 hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={`${item.productId}-${item.variationId}`} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-display font-bold text-foreground">{formatPrice(totalCents())}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setCartOpen(false);
                navigate("/cart");
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
