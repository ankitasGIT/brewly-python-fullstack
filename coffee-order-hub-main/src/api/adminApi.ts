import api from "./axios";
import type { Order } from "./orderApi";
import type { UserResponse } from "./authApi";

export interface CreateManagerRequest {
  email: string;
  password: string;
}

export interface CreateProductRequest {
  name: string;
  base_price_cents: number;
  variations: { name: string; price_change_cents: number }[];
}

export interface UpdateProductRequest {
  name?: string;
  base_price_cents?: number;
}

export interface UpdateVariationRequest {
  name?: string;
  price_change_cents?: number;
}

export interface VariationResponse {
  id: string;
  name: string;
  price_change_cents: number;
}

export interface ProductAdminResponse {
  id: string;
  name: string;
  base_price_cents: number;
  variations: VariationResponse[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/admin/orders");
  return response.data;
}

export async function createManager(data: CreateManagerRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/admin/managers", data);
  return response.data;
}

export async function createProduct(data: CreateProductRequest): Promise<ProductAdminResponse> {
  const response = await api.post<ProductAdminResponse>("/admin/products", data);
  return response.data;
}

export async function updateProduct(
  productId: string,
  data: UpdateProductRequest
): Promise<ProductAdminResponse> {
  const response = await api.patch<ProductAdminResponse>(`/admin/products/${productId}`, data);
  return response.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/admin/products/${productId}`);
}

export async function updateVariation(
  productId: string,
  variationId: string,
  data: UpdateVariationRequest
): Promise<VariationResponse> {
  const response = await api.patch<VariationResponse>(
    `/admin/products/${productId}/variations/${variationId}`,
    data
  );
  return response.data;
}

export async function deleteVariation(productId: string, variationId: string): Promise<void> {
  await api.delete(`/admin/products/${productId}/variations/${variationId}`);
}
