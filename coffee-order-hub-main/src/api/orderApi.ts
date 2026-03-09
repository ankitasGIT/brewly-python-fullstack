import api from "./axios";
import type { OrderStatus } from "@/utils/constants";

export interface OrderItemResponse {
  product_id: string;
  variation_id: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  product_name: string;
  variation_name: string;
  variation_price_change_cents: number;
  product_base_price_cents: number;
}

export interface PaymentInfo {
  id: string;
  amount_cents: number;
  response_status_code: number;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_cents: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  items: OrderItemResponse[];
  payment?: PaymentInfo;
}

export interface CreateOrderRequest {
  items: { product_id: string; variation_id: string; quantity: number }[];
  total_cents: number;
  metadata?: Record<string, unknown>;
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const response = await api.post<Order>("/orders", data, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return response.data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
  return response.data;
}
