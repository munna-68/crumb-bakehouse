import { BUSY } from "./data";
import { dowOf, isCounted, isLive } from "./format";
import type { DayHours, MenuItem, Order, TimeOff } from "./types";

interface Slice {
  today: Date;
  now: number;
  orders: Order[];
  hours: Record<number, DayHours>;
  timeOff: TimeOff[];
  history: Record<number, number>;
  menu: MenuItem[];
}

export const ordersOn = (s: Pick<Slice, "orders">, day: number) =>
  s.orders.filter((o) => o.day === day).sort((a, b) => a.time - b.time);

export function dayRevenue(s: Slice, day: number) {
  if (day < 0) return s.history[day] ?? 0;
  return ordersOn(s, day)
    .filter((o) => isCounted(o.status))
    .reduce((sum, o) => sum + o.total, 0);
}

export function todayStats(s: Slice) {
  const list = ordersOn(s, 0);
  const counted = list.filter((o) => isCounted(o.status));
  const expected = counted.reduce((sum, o) => sum + o.total, 0);
  const collected = list.filter((o) => o.status === "picked_up").reduce((sum, o) => sum + o.total, 0);
  const pending = s.orders.filter((o) => o.status === "pending" && o.day >= 0);
  const remaining = list.filter((o) => (o.status === "confirmed" || o.status === "ready") && o.time >= s.now - 30);
  return {
    expected,
    collected,
    count: counted.length,
    pickedUp: list.filter((o) => o.status === "picked_up").length,
    pending,
    remaining,
    missedToday: list.filter((o) => o.status === "no_show" || o.status === "cancelled").length,
  };
}

export type BarKind = "past" | "today" | "future" | "closed";
export interface Bar {
  offset: number;
  dow: number;
  value: number;
  kind: BarKind;
}

/** Monday-first week. weekShift 0 = this week, -1 = last week. */
export function weekBars(s: Slice, weekShift = 0): Bar[] {
  const todayDow = s.today.getDay();
  const mondayOffset = -((todayDow + 6) % 7) + weekShift * 7;
  return Array.from({ length: 7 }, (_, i) => {
    const offset = mondayOffset + i;
    const dow = dowOf(s.today, offset);
    const open = isOpen(s, offset);
    const value = dayRevenue(s, offset);
    const kind: BarKind = !open && value === 0 ? "closed" : offset < 0 ? "past" : offset === 0 ? "today" : "future";
    return { offset, dow, value, kind };
  });
}

export function monthDots(s: Slice) {
  return Array.from({ length: 30 }, (_, i) => {
    const offset = i - 29;
    return { offset, value: dayRevenue(s, offset) };
  });
}

export function isOpen(s: Pick<Slice, "today" | "hours" | "timeOff">, day: number) {
  const dow = dowOf(s.today, day);
  if (!s.hours[dow]?.open) return false;
  return !s.timeOff.some((t) => day >= t.from && day <= t.to);
}

export function slotsFor(s: Slice, day: number, ignoreId?: string) {
  if (!isOpen(s, day)) return [];
  const h = s.hours[dowOf(s.today, day)];
  const taken = ordersOn(s, day).filter((o) => isLive(o.status) && o.id !== ignoreId);
  const out: { time: number; left: number }[] = [];
  for (let t = h.start; t <= h.end - 30; t += 30) {
    if (day === 0 && t < s.now + 30) continue;
    const used = taken.filter((o) => o.time >= t && o.time < t + 30).length;
    out.push({ time: t, left: Math.max(0, h.capacity - used) });
  }
  return out;
}

export function nextOpenDays(s: Slice, count: number, from = 0) {
  const out: number[] = [];
  for (let d = from; out.length < count && d < from + 21; d++) {
    if (isOpen(s, d) && slotsFor(s, d).some((x) => x.left > 0)) out.push(d);
  }
  return out;
}

export function soldToday(s: Pick<Slice, "orders">, itemId: string) {
  return ordersOn(s, 0)
    .filter((o) => isCounted(o.status))
    .reduce((sum, o) => sum + o.lines.filter((l) => l.itemId === itemId).reduce((a, l) => a + l.qty, 0), 0);
}

const WEEK_BASE: Record<string, number> = {
  sourdough: 61,
  buns: 54,
  croissant: 27,
  cookies: 38,
  focaccia: 22,
  rye: 19,
  pumpkin: 24,
  galette: 14,
  cake: 5,
};

export function bestSellers(s: Slice) {
  return s.menu
    .map((m) => {
      const units = (WEEK_BASE[m.id] ?? 0) + soldToday(s, m.id);
      return { item: m, units, revenue: units * m.price };
    })
    .filter((x) => x.units > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

export function missed(s: Pick<Slice, "orders">) {
  return s.orders
    .filter((o) => (o.status === "no_show" || o.status === "cancelled") && o.day <= 0 && o.day >= -30)
    .sort((a, b) => b.day - a.day || b.time - a.time);
}

/** Orders per hour, Monday-first, open days only. */
export function busyGrid(s: Pick<Slice, "hours">) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order
    .filter((d) => s.hours[d].open)
    .map((d) => ({ dow: d, counts: BUSY[d].some((c) => c > 0) ? BUSY[d] : BUSY[2] }));
}

/** Orders completed over the last 30 days, used for pickup rate. */
export const COMPLETED_30D = 284;
