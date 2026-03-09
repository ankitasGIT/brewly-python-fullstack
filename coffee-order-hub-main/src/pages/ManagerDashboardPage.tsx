import { useAllOrders } from "@/hooks/useOrders";
import { OrderBoard } from "@/components/manager/OrderBoard";
import { Navbar } from "@/components/layout/Navbar";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, RefreshCw, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AddManagerModal } from "@/components/manager/AddManagerModal";
import { Link } from "react-router-dom";

const ManagerDashboardPage = () => {
  const { data: orders, isLoading, isError } = useAllOrders();
  const queryClient = useQueryClient();
  const [showAddManager, setShowAddManager] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Order Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage and track all orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/manager/products">
              <Button variant="outline" size="sm" className="gap-1">
                <Package className="h-4 w-4" /> Products
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAddManager(true)}>
              <UserPlus className="h-4 w-4" /> Add Manager
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })}
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
            <p>Failed to load orders.</p>
          </div>
        )}

        {orders && <OrderBoard orders={orders} />}
      </main>

      <AddManagerModal open={showAddManager} onClose={() => setShowAddManager(false)} />
    </div>
  );
};

export default ManagerDashboardPage;
