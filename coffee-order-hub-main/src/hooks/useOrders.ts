import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrder, createOrder, updateOrderStatus, type CreateOrderRequest } from "@/api/orderApi";
import { fetchAllOrders } from "@/api/adminApi";
import { createManager, type CreateManagerRequest } from "@/api/adminApi";
import type { OrderStatus } from "@/utils/constants";
import { toast } from "@/hooks/use-toast";

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
    refetchInterval: 10000,
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAllOrders,
    refetchInterval: 15000,
    retry: 2,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order placed!", description: "Your order has been submitted successfully." });
    },
    onError: (error: { response?: { status?: number; data?: { detail?: string } } }) => {
      const detail = error?.response?.data?.detail || "Could not place your order. Please try again.";
      const title = error?.response?.status === 402 ? "Payment failed" : "Order failed";
      toast({ title, description: detail, variant: "destructive" });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.setQueryData(["orders", updatedOrder.id], updatedOrder);
      toast({ title: "Status updated", description: "Order status has been updated." });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const detail = error?.response?.data?.detail || "Could not update order status.";
      toast({ title: "Update failed", description: detail, variant: "destructive" });
    },
  });
}

export function useCreateManager() {
  return useMutation({
    mutationFn: (data: CreateManagerRequest) => createManager(data),
    onSuccess: () => {
      toast({ title: "Manager created", description: "New manager account has been created." });
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const detail = error?.response?.data?.detail || "Could not create manager.";
      toast({ title: "Failed", description: detail, variant: "destructive" });
    },
  });
}
