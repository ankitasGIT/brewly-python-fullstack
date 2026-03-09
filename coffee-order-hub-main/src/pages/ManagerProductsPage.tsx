import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariation,
  deleteVariation,
} from "@/api/adminApi";
import { formatPrice } from "@/utils/price";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/api/menuApi";

function VariationRow({
  productId,
  variation,
  onDeleted,
}: {
  productId: string;
  variation: Product["variations"][number];
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(variation.name);
  const [priceCents, setPriceCents] = useState(String(variation.price_change_cents));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVariation(productId, variation.id, {
        name,
        price_change_cents: Number(priceCents),
      });
      toast({ title: "Variation updated" });
      setEditing(false);
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVariation(productId, variation.id);
      toast({ title: "Variation deleted" });
      onDeleted();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 border-b border-border last:border-0">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs" placeholder="Name" />
        <Input
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          className="h-7 text-xs w-24"
          placeholder="Price change (¢)"
          type="number"
        />
        <button onClick={handleSave} disabled={saving} className="text-primary hover:text-primary/80">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-foreground">
        {variation.name}
        {variation.price_change_cents > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">+{formatPrice(variation.price_change_cents)}</span>
        )}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground p-1">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={handleDelete} className="text-destructive hover:text-destructive/80 p-1">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ProductRow({ product, onRefresh }: { product: Product; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [baseCents, setBaseCents] = useState(String(product.base_price_cents));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProduct(product.id, { name, base_price_cents: Number(baseCents) });
      toast({ title: "Product updated" });
      setEditing(false);
      onRefresh();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      toast({ title: "Product deleted" });
      onRefresh();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {editing ? (
        <div className="flex items-center gap-2 mb-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" placeholder="Product name" />
          <Input
            value={baseCents}
            onChange={(e) => setBaseCents(e.target.value)}
            className="h-8 w-32"
            placeholder="Base (¢)"
            type="number"
          />
          <button onClick={handleSave} disabled={saving} className="text-primary hover:text-primary/80">
            <Check className="h-5 w-5" />
          </button>
          <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground">Base: {formatPrice(product.base_price_cents)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="p-1.5 text-muted-foreground hover:text-foreground rounded">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="p-1.5 text-destructive hover:text-destructive/80 rounded">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Variations</p>
        {product.variations.map((v) => (
          <VariationRow key={v.id} productId={product.id} variation={v} onDeleted={onRefresh} />
        ))}
        {product.variations.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No variations</p>
        )}
      </div>
    </div>
  );
}

function AddProductForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [baseCents, setBaseCents] = useState("");
  const [variations, setVariations] = useState<{ name: string; price_change_cents: string }[]>([
    { name: "", price_change_cents: "0" },
  ]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseCents) return;
    setSaving(true);
    try {
      await createProduct({
        name: name.trim(),
        base_price_cents: Number(baseCents),
        variations: variations
          .filter((v) => v.name.trim())
          .map((v) => ({ name: v.name.trim(), price_change_cents: Number(v.price_change_cents) })),
      });
      toast({ title: "Product created" });
      setName("");
      setBaseCents("");
      setVariations([{ name: "", price_change_cents: "0" }]);
      onAdded();
    } catch {
      toast({ title: "Failed to create product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-display font-semibold">Add New Product</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Product Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Latte" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Base Price (cents)</Label>
          <Input
            value={baseCents}
            onChange={(e) => setBaseCents(e.target.value)}
            placeholder="450"
            type="number"
            min={0}
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Variations</Label>
        {variations.map((v, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Input
              value={v.name}
              onChange={(e) => setVariations((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
              placeholder="e.g. Small"
              className="flex-1"
            />
            <Input
              value={v.price_change_cents}
              onChange={(e) => setVariations((prev) => prev.map((x, j) => j === i ? { ...x, price_change_cents: e.target.value } : x))}
              placeholder="Price Δ (¢)"
              type="number"
              min={0}
              className="w-28"
            />
            {variations.length > 1 && (
              <button type="button" onClick={() => setVariations((prev) => prev.filter((_, j) => j !== i))} className="text-destructive">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setVariations((prev) => [...prev, { name: "", price_change_cents: "0" }])}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Variation
        </Button>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving && <Spinner size="sm" />}
        Create Product
      </Button>
    </form>
  );
}

const ManagerProductsPage = () => {
  const { data: products, isLoading, isError, refetch } = useMenu();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Product Management</h1>
          <p className="mt-1 text-muted-foreground">Create, edit and delete products and variations</p>
        </div>

        <div className="mb-8">
          <AddProductForm onAdded={() => refetch()} />
        </div>

        {isLoading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
            <p>Failed to load products.</p>
          </div>
        )}

        {products && (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onRefresh={() => refetch()} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerProductsPage;
