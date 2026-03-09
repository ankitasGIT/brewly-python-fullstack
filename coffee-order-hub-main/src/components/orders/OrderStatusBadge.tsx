import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type OrderStatus } from "@/utils/constants";

interface Props {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", STATUS_COLORS[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
