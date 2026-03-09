import { useCartStore, type CartItem as CartItemType } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import { Minus, Plus, Trash2 } from "lucide-react";

interface Props {
  item: CartItemType;
}

export function CartItem({ item }: Props) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{item.productName}</p>
        <p className="text-xs text-muted-foreground">{item.variationName}</p>
        <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item.priceCents * item.quantity)}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
        <button
          onClick={() => removeItem(item.productId, item.variationId)}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
