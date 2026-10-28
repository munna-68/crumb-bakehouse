export type Category = "Bread" | "Pastry" | "Cakes" | "Seasonal";
export type Glyph = "loaf" | "rye" | "cookie" | "bun" | "galette" | "cake" | "croissant" | "focaccia" | "pumpkin";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  dailyLimit: number;
  available: boolean;
  glyph: Glyph;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "picked_up"
  | "no_show"
  | "cancelled"
  | "declined";

export interface OrderLine {
  itemId: string;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  lines: OrderLine[];
  total: number;
  /** Day offset from demo "today" (0 = today, -3 = three days ago). */
  day: number;
  /** Minutes after midnight. */
  time: number;
  status: OrderStatus;
  note?: string;
  channel: "Website" | "Instagram" | "Phone";
  placedAgo: string;
  /** Set when an order lands live so the UI can flash it. */
  fresh?: boolean;
  cancelReason?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  noShows: number;
  since: string;
  tag?: string;
  allergy?: string;
}

export interface DayHours {
  open: boolean;
  start: number; // minutes
  end: number; // minutes
  capacity: number; // orders per 30-min slot
}

export interface TimeOff {
  id: string;
  label: string;
  /** Day offset from today. */
  from: number;
  to: number;
}

export type NoticeKind = "order" | "cancel" | "noshow" | "review" | "payout" | "system";

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  orderId?: string;
}

export type ToastTone = "neutral" | "success" | "danger" | "incoming";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
  orderId?: string;
  undo?: () => void;
}

export type Tab = "today" | "orders" | "insights" | "shop";
