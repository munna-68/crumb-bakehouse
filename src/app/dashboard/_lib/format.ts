import type { OrderStatus } from "./types";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const money = (n: number, cents = false) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

export function clock(mins: number, withPeriod = true) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  const period = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const base = `${h}:${m.toString().padStart(2, "0")}`;
  return withPeriod ? `${base} ${period}` : base;
}

export const period = (mins: number) => (Math.floor(mins / 60) % 24 >= 12 ? "PM" : "AM");

export function dateFor(today: Date, offset: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d;
}

export const dowOf = (today: Date, offset: number) => dateFor(today, offset).getDay();
export const dayShort = (dow: number) => DAY_SHORT[dow];
export const dayLong = (dow: number) => DAY_LONG[dow];

export function dayLabel(today: Date, offset: number, style: "short" | "long" = "short") {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  if (offset === -1) return "Yesterday";
  const d = dateFor(today, offset);
  return style === "long"
    ? `${DAY_LONG[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
    : `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function shortDate(today: Date, offset: number) {
  const d = dateFor(today, offset);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export const firstLast = (name: string) => {
  const [f, l] = name.split(" ");
  return l ? `${f} ${l[0]}.` : f;
};

export const STATUS_META: Record<OrderStatus, { label: string; tone: "ink" | "sage" | "crust" | "rose" | "muted" | "butter" }> = {
  pending: { label: "Needs reply", tone: "butter" },
  confirmed: { label: "Confirmed", tone: "sage" },
  ready: { label: "Ready", tone: "ink" },
  picked_up: { label: "Picked up", tone: "muted" },
  no_show: { label: "No-show", tone: "crust" },
  cancelled: { label: "Cancelled", tone: "rose" },
  declined: { label: "Declined", tone: "rose" },
};

export const isLive = (s: OrderStatus) => s === "pending" || s === "confirmed" || s === "ready";
export const isCounted = (s: OrderStatus) => s !== "cancelled" && s !== "declined" && s !== "no_show";

export function greeting(mins: number) {
  if (mins < 12 * 60) return "Morning";
  if (mins < 17 * 60) return "Afternoon";
  return "Evening";
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
