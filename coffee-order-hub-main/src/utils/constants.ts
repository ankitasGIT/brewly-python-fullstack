export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const ORDER_STATUSES = ["waiting", "preparation", "ready", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  waiting: "Waiting",
  preparation: "In Preparation",
  ready: "Ready",
  delivered: "Delivered",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  waiting: "bg-coffee-amber/20 text-coffee-amber",
  preparation: "bg-coffee-info/20 text-coffee-info",
  ready: "bg-coffee-success/20 text-coffee-success",
  delivered: "bg-muted text-muted-foreground",
};
