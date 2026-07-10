// Mirrors the backend's forward-only order status state machine
// (apps/orders/services.py: STATUS_FLOW / can_transition). Keeping this in
// sync lets the UI only ever offer transitions the API will accept, so a
// staff member can't pick an invalid next status in the first place.
import type { OrderStatus } from "./types";

export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "processing", "cancelled"],
  paid: ["processing", "measuring", "cancelled", "refunded"],
  processing: ["measuring", "sewing", "shipped", "cancelled"],
  measuring: ["sewing", "cancelled"],
  sewing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
};

/** Valid next statuses from the current one (does not include the current status itself). */
export function nextStatuses(current: OrderStatus): OrderStatus[] {
  return STATUS_FLOW[current] ?? [];
}

/** A status with no further transitions (order lifecycle ended). */
export function isTerminalStatus(current: OrderStatus): boolean {
  return nextStatuses(current).length === 0;
}
