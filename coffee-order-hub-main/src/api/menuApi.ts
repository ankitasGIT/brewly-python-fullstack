import api from "./axios";

export interface Variation {
  id: string;
  name: string;
  price_change_cents: number;
}

export interface Product {
  id: string;
  name: string;
  base_price_cents: number;
  variations: Variation[];
}

export interface MenuResponse {
  products: Product[];
}

export async function fetchMenu(): Promise<Product[]> {
  const response = await api.get<MenuResponse>("/menu");
  return response.data.products;
}
