import { useState } from "react";
import type { Product, Variation } from "@/api/menuApi";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import { Button } from "@/components/ui/button";
import { Coffee, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    product.variations.length === 1 ? product.variations[0] : null
  );
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  const getVariationPriceCents = (v: Variation) => product.base_price_cents + v.price_change_cents;

  const handleAdd = () => {
    if (!selectedVariation) {
      toast({ title: "Select a size", description: "Please choose a variation first.", variant: "destructive" });
      return;
    }
    addItem({
      productId: product.id,
      variationId: selectedVariation.id,
      productName: product.name,
      variationName: selectedVariation.name,
      priceCents: getVariationPriceCents(selectedVariation),
    });
    setJustAdded(true);
    setCartOpen(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group rounded-lg border border-border bg-card p-5 transition-all hover:shadow-lg hover:shadow-primary/5 animate-scale-in">
      <div className="mb-4 flex h-36 items-center justify-center rounded-md bg-secondary">
        <Coffee className="h-12 w-12 text-primary/40 transition-transform group-hover:scale-110" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatPrice(product.base_price_cents)} base
      </p>

      {product.variations.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variations.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariation(v)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                selectedVariation?.id === v.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {v.name}
              {v.price_change_cents > 0 && ` +${formatPrice(v.price_change_cents)}`}
              {" · "}{formatPrice(getVariationPriceCents(v))}
            </button>
          ))}
        </div>
      )}

      {product.variations.length === 1 && selectedVariation && (
        <p className="mt-2 text-sm font-semibold text-primary">
          {formatPrice(getVariationPriceCents(selectedVariation))}
        </p>
      )}

      <Button
        onClick={handleAdd}
        className="mt-4 w-full gap-2"
        variant={justAdded ? "secondary" : "default"}
      >
        {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {justAdded ? "Added!" : "Add to Cart"}
      </Button>
    </div>
  );
}
