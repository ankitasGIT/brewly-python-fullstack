import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Coffee, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = isAuthenticated
    ? role === "manager"
      ? [
          { to: "/manager/dashboard", label: "Dashboard" },
          { to: "/manager/products", label: "Products" },
        ]
      : [
          { to: "/menu", label: "Menu" },
          { to: "/orders", label: "My Orders" },
        ]
    : [];

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={isAuthenticated ? (role === "manager" ? "/manager/dashboard" : "/menu") : "/login"} className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">Brewly</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === to ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}

          {isAuthenticated && role === "customer" && (
            <button onClick={toggleCart} className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalItems()}
                </span>
              )}
            </button>
          )}

          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && role === "customer" && (
            <button onClick={toggleCart} className="relative p-2 text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {totalItems()}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-muted-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden animate-fade-in">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <button onClick={handleLogout} className="mt-2 flex items-center gap-1 py-2 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
