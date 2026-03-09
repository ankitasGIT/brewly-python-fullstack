import { useMenu } from "@/hooks/useMenu";
import { ProductCard } from "@/components/menu/ProductCard";
import { Spinner } from "@/components/ui/spinner";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AlertCircle } from "lucide-react";

const MenuPage = () => {
  const { data: products, isLoading, isError } = useMenu();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Our Menu</h1>
          <p className="mt-1 text-muted-foreground">Handcrafted beverages made with love</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
            <p className="text-sm">Failed to load menu. Please try again.</p>
          </div>
        )}

        {products && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
