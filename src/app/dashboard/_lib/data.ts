import type { Customer, DayHours, MenuItem, Notice, Order, OrderLine, TimeOff } from "./types";

/** The demo clock starts mid-morning so the day always has history and things still ahead. */
export const DEMO_START_MINUTES = 10 * 60 + 42;

export const BUSINESS = {
  name: "Crumb Bakehouse",
  owner: "Nora Castillo",
  firstName: "Nora",
  city: "East Austin, TX",
  site: "crumbbakehouse.com",
};

export const MENU: MenuItem[] = [
  {
    id: "sourdough",
    name: "Country Sourdough",
    description: "48-hour cold ferment, blistered crust, open crumb.",
    category: "Bread",
    price: 12,
    dailyLimit: 24,
    available: true,
    glyph: "loaf",
  },
  {
    id: "rye",
    name: "Seeded Rye",
    description: "Sunflower, flax and caraway. Keeps all week.",
    category: "Bread",
    price: 13,
    dailyLimit: 12,
    available: true,
    glyph: "rye",
  },
  {
    id: "focaccia",
    name: "Rosemary Focaccia",
    description: "Olive oil, flaky salt, rosemary from the garden.",
    category: "Bread",
    price: 14,
    dailyLimit: 10,
    available: true,
    glyph: "focaccia",
  },
  {
    id: "buns",
    name: "Cardamom Morning Buns",
    description: "Box of 4. Laminated dough, orange-cardamom sugar.",
    category: "Pastry",
    price: 16,
    dailyLimit: 20,
    available: true,
    glyph: "bun",
  },
  {
    id: "croissant",
    name: "Butter Croissants",
    description: "Box of 6. European butter, three-day process.",
    category: "Pastry",
    price: 27,
    dailyLimit: 12,
    available: true,
    glyph: "croissant",
  },
  {
    id: "cookies",
    name: "Brown Butter Chocolate Chip",
    description: "Half dozen. Dark chocolate pools, sea salt.",
    category: "Pastry",
    price: 18,
    dailyLimit: 18,
    available: true,
    glyph: "cookie",
  },
  {
    id: "galette",
    name: "Pear & Ginger Galette",
    description: "Serves 6. Bosc pears, candied ginger, rye crust.",
    category: "Seasonal",
    price: 34,
    dailyLimit: 6,
    available: false,
    glyph: "galette",
  },
  {
    id: "pumpkin",
    name: "Pumpkin Chai Loaf",
    description: "Roasted pumpkin, house chai spice, pepita crunch.",
    category: "Seasonal",
    price: 15,
    dailyLimit: 10,
    available: true,
    glyph: "pumpkin",
  },
  {
    id: "cake",
    name: "Celebration Cake, 6-inch",
    description: "Vanilla bean or chocolate. Order 48 hours ahead.",
    category: "Cakes",
    price: 72,
    dailyLimit: 2,
    available: true,
    glyph: "cake",
  },
];

export const CUSTOMERS: Customer[] = [
  { id: "c01", name: "Marcus Bell", phone: "(512) 555-0148", orders: 23, spent: 612, noShows: 0, since: "Mar 2025", tag: "Regular" },
  { id: "c02", name: "Jenna Whitfield", phone: "(512) 555-0193", orders: 31, spent: 884, noShows: 0, since: "Jan 2025", tag: "Regular" },
  { id: "c03", name: "Tom Alvarez", phone: "(737) 555-0122", orders: 6, spent: 94, noShows: 2, since: "Jul 2026" },
  { id: "c04", name: "Aisha Rahman", phone: "(512) 555-0176", orders: 12, spent: 418, noShows: 0, since: "Nov 2025" },
  { id: "c05", name: "Rachel Kim", phone: "(512) 555-0110", orders: 9, spent: 286, noShows: 0, since: "Feb 2026" },
  { id: "c06", name: "Derek Lindqvist", phone: "(512) 555-0157", orders: 4, spent: 52, noShows: 0, since: "Aug 2026" },
  { id: "c07", name: "Olivia Martinez", phone: "(737) 555-0181", orders: 17, spent: 503, noShows: 0, since: "Apr 2025", tag: "Regular" },
  { id: "c08", name: "Sam Patel", phone: "(512) 555-0134", orders: 8, spent: 221, noShows: 0, since: "May 2026" },
  { id: "c09", name: "Grace Thompson", phone: "(512) 555-0169", orders: 5, spent: 341, noShows: 0, since: "Dec 2025", allergy: "Tree nuts" },
  { id: "c10", name: "Luis Ortega", phone: "(737) 555-0105", orders: 1, spent: 0, noShows: 0, since: "New", tag: "First order" },
  { id: "c11", name: "Hannah Brooks", phone: "(512) 555-0142", orders: 3, spent: 108, noShows: 0, since: "Sep 2026" },
  { id: "c12", name: "Kevin Nguyen", phone: "(512) 555-0188", orders: 14, spent: 362, noShows: 0, since: "Jun 2025" },
  { id: "c13", name: "Emily Carter", phone: "(737) 555-0199", orders: 2, spent: 50, noShows: 0, since: "Oct 2026" },
  { id: "c14", name: "Ben Rossi", phone: "(512) 555-0116", orders: 11, spent: 247, noShows: 0, since: "Sep 2025" },
  { id: "c15", name: "Chloe Bennett", phone: "(512) 555-0127", orders: 4, spent: 233, noShows: 0, since: "Mar 2026" },
  { id: "c16", name: "Chris Dalton", phone: "(737) 555-0164", orders: 7, spent: 139, noShows: 2, since: "May 2026" },
  { id: "c17", name: "Megan Ford", phone: "(512) 555-0153", orders: 5, spent: 96, noShows: 1, since: "Jun 2026" },
  { id: "c18", name: "Natalie Price", phone: "(512) 555-0171", orders: 3, spent: 118, noShows: 0, since: "Jan 2026" },
  { id: "c19", name: "Ryan Castellano", phone: "(737) 555-0138", orders: 6, spent: 152, noShows: 0, since: "Apr 2026" },
  { id: "c20", name: "Jess Moreno", phone: "(512) 555-0192", orders: 9, spent: 204, noShows: 0, since: "Oct 2025" },
  { id: "c21", name: "Theo Walsh", phone: "(512) 555-0103", orders: 19, spent: 471, noShows: 0, since: "Feb 2025", tag: "Regular" },
  { id: "c22", name: "Maya Goldberg", phone: "(737) 555-0145", orders: 7, spent: 255, noShows: 0, since: "Jan 2026" },
  { id: "c23", name: "Andre Wilson", phone: "(512) 555-0160", orders: 10, spent: 298, noShows: 0, since: "Aug 2025" },
  { id: "c24", name: "Sofia Ramirez", phone: "(512) 555-0185", orders: 2, spent: 86, noShows: 0, since: "Sep 2026" },
  // Customers who arrive live during the demo
  { id: "c30", name: "Anjali Mehta", phone: "(512) 555-0131", orders: 6, spent: 207, noShows: 0, since: "Feb 2026" },
  { id: "c31", name: "Jordan Wells", phone: "(737) 555-0119", orders: 1, spent: 0, noShows: 0, since: "New", tag: "First order" },
  { id: "c32", name: "Lucy Harmon", phone: "(512) 555-0177", orders: 13, spent: 389, noShows: 0, since: "May 2025", tag: "Regular" },
];

const price = (id: string) => MENU.find((m) => m.id === id)!.price;
const lines = (...pairs: [string, number][]): OrderLine[] => pairs.map(([itemId, qty]) => ({ itemId, qty }));
export const totalOf = (l: OrderLine[]) => l.reduce((s, x) => s + price(x.itemId) * x.qty, 0);

const t = (h: number, m = 0) => h * 60 + m;

type Seed = Omit<Order, "total">;

const SEED_ORDERS: Seed[] = [
  // Today
  { id: "CB-2041", customerId: "c01", lines: lines(["sourdough", 2], ["buns", 1]), day: 0, time: t(8), status: "picked_up", channel: "Website", placedAgo: "Mon" },
  { id: "CB-2042", customerId: "c02", lines: lines(["croissant", 1]), day: 0, time: t(8, 15), status: "picked_up", channel: "Instagram", placedAgo: "Mon" },
  { id: "CB-2043", customerId: "c03", lines: lines(["rye", 1]), day: 0, time: t(8, 30), status: "no_show", channel: "Website", placedAgo: "Tue" },
  { id: "CB-2044", customerId: "c04", lines: lines(["cookies", 2], ["focaccia", 1]), day: 0, time: t(9), status: "picked_up", channel: "Website", placedAgo: "Tue" },
  { id: "CB-2045", customerId: "c05", lines: lines(["galette", 1]), day: 0, time: t(9, 30), status: "picked_up", channel: "Website", placedAgo: "Sun" },
  { id: "CB-2046", customerId: "c06", lines: lines(["sourdough", 1]), day: 0, time: t(10), status: "cancelled", channel: "Website", placedAgo: "Tue", cancelReason: "Cancelled by customer at 7:12 AM" },
  { id: "CB-2047", customerId: "c07", lines: lines(["buns", 2]), day: 0, time: t(10, 15), status: "picked_up", channel: "Phone", placedAgo: "Tue" },
  { id: "CB-2048", customerId: "c08", lines: lines(["pumpkin", 1], ["cookies", 1]), day: 0, time: t(10, 45), status: "ready", channel: "Website", placedAgo: "Yesterday" },
  { id: "CB-2049", customerId: "c09", lines: lines(["cake", 1]), day: 0, time: t(11), status: "confirmed", channel: "Website", placedAgo: "Sat", note: "“Happy 40th, Dave” in dark chocolate script. No nuts anywhere, please." },
  { id: "CB-2050", customerId: "c10", lines: lines(["focaccia", 2]), day: 0, time: t(11, 30), status: "pending", channel: "Instagram", placedAgo: "24m ago" },
  { id: "CB-2051", customerId: "c11", lines: lines(["croissant", 2]), day: 0, time: t(12), status: "pending", channel: "Website", placedAgo: "52m ago", note: "Team breakfast, could you box them separately?" },
  { id: "CB-2052", customerId: "c12", lines: lines(["sourdough", 1], ["rye", 1]), day: 0, time: t(12, 30), status: "confirmed", channel: "Website", placedAgo: "Yesterday" },
  { id: "CB-2053", customerId: "c13", lines: lines(["galette", 1], ["cookies", 1]), day: 0, time: t(13, 15), status: "pending", channel: "Website", placedAgo: "1h ago" },
  { id: "CB-2054", customerId: "c14", lines: lines(["buns", 1]), day: 0, time: t(13, 45), status: "confirmed", channel: "Phone", placedAgo: "Yesterday" },

  // Tomorrow
  { id: "CB-2055", customerId: "c21", lines: lines(["sourdough", 2]), day: 1, time: t(8, 30), status: "confirmed", channel: "Website", placedAgo: "Mon" },
  { id: "CB-2056", customerId: "c22", lines: lines(["croissant", 1], ["buns", 1]), day: 1, time: t(9, 30), status: "confirmed", channel: "Website", placedAgo: "Tue" },
  { id: "CB-2057", customerId: "c23", lines: lines(["focaccia", 1], ["rye", 1]), day: 1, time: t(10), status: "pending", channel: "Instagram", placedAgo: "2h ago" },
  { id: "CB-2058", customerId: "c02", lines: lines(["buns", 2]), day: 1, time: t(11), status: "confirmed", channel: "Instagram", placedAgo: "Yesterday" },
  { id: "CB-2059", customerId: "c24", lines: lines(["pumpkin", 2]), day: 1, time: t(12, 30), status: "confirmed", channel: "Website", placedAgo: "Yesterday" },

  // Day after
  { id: "CB-2060", customerId: "c07", lines: lines(["cookies", 2]), day: 2, time: t(9), status: "confirmed", channel: "Phone", placedAgo: "Tue" },
  { id: "CB-2061", customerId: "c12", lines: lines(["sourdough", 1]), day: 2, time: t(10, 30), status: "confirmed", channel: "Website", placedAgo: "Yesterday" },
  { id: "CB-2062", customerId: "c04", lines: lines(["croissant", 1]), day: 2, time: t(11, 30), status: "confirmed", channel: "Website", placedAgo: "Yesterday" },
  { id: "CB-2063", customerId: "c20", lines: lines(["focaccia", 1], ["pumpkin", 1]), day: 2, time: t(13), status: "confirmed", channel: "Website", placedAgo: "3h ago" },

  // Further out
  { id: "CB-2064", customerId: "c15", lines: lines(["cake", 1], ["cookies", 1]), day: 3, time: t(10), status: "pending", channel: "Website", placedAgo: "3h ago", note: "Vanilla bean with berries. “Congrats, Maya!” on top." },
  { id: "CB-2065", customerId: "c01", lines: lines(["sourdough", 2], ["buns", 1]), day: 3, time: t(8), status: "confirmed", channel: "Website", placedAgo: "Tue" },
  { id: "CB-2066", customerId: "c21", lines: lines(["croissant", 2]), day: 3, time: t(9), status: "confirmed", channel: "Website", placedAgo: "Mon" },
  { id: "CB-2067", customerId: "c05", lines: lines(["pumpkin", 1], ["rye", 1]), day: 3, time: t(9, 30), status: "confirmed", channel: "Instagram", placedAgo: "Yesterday" },
  { id: "CB-2068", customerId: "c23", lines: lines(["buns", 3]), day: 3, time: t(10, 30), status: "confirmed", channel: "Website", placedAgo: "Yesterday" },
  { id: "CB-2069", customerId: "c14", lines: lines(["sourdough", 1], ["focaccia", 1]), day: 4, time: t(9), status: "confirmed", channel: "Phone", placedAgo: "Tue" },
  { id: "CB-2070", customerId: "c22", lines: lines(["cake", 1]), day: 4, time: t(11), status: "confirmed", channel: "Website", placedAgo: "Sun", note: "Chocolate. “Happy Anniversary, J & R.”" },

  // Missed pickups, last 30 days
  { id: "CB-2031", customerId: "c19", lines: lines(["buns", 2]), day: -2, time: t(9, 30), status: "cancelled", channel: "Website", placedAgo: "", cancelReason: "Cancelled 40 min before pickup" },
  { id: "CB-2019", customerId: "c16", lines: lines(["croissant", 1]), day: -4, time: t(8, 45), status: "no_show", channel: "Instagram", placedAgo: "" },
  { id: "CB-2011", customerId: "c18", lines: lines(["cake", 1]), day: -6, time: t(11), status: "cancelled", channel: "Website", placedAgo: "", cancelReason: "Event postponed, cancelled 2 days ahead" },
  { id: "CB-1994", customerId: "c03", lines: lines(["sourdough", 1]), day: -9, time: t(12), status: "no_show", channel: "Website", placedAgo: "" },
  { id: "CB-1982", customerId: "c17", lines: lines(["cookies", 1]), day: -12, time: t(13), status: "no_show", channel: "Website", placedAgo: "" },
  { id: "CB-1967", customerId: "c20", lines: lines(["sourdough", 1]), day: -15, time: t(10), status: "cancelled", channel: "Phone", placedAgo: "", cancelReason: "Cancelled the night before" },
  { id: "CB-1951", customerId: "c16", lines: lines(["buns", 1]), day: -18, time: t(9), status: "no_show", channel: "Instagram", placedAgo: "" },
];

export const ORDERS: Order[] = SEED_ORDERS.map((o) => ({ ...o, total: totalOf(o.lines) }));

/** Orders that land on their own while the dashboard is open. */
export const INCOMING: Seed[] = [
  {
    id: "CB-2071",
    customerId: "c30",
    lines: lines(["buns", 2], ["cookies", 1]),
    day: 0,
    time: t(13, 30),
    status: "pending",
    channel: "Website",
    placedAgo: "Just now",
    note: "Picking up for my daughter’s soccer team!",
  },
  {
    id: "CB-2072",
    customerId: "c31",
    lines: lines(["cake", 1], ["croissant", 1]),
    day: 3,
    time: t(11),
    status: "pending",
    channel: "Instagram",
    placedAgo: "Just now",
    note: "Chocolate, “Happy 7th Birthday, Noor” in pink.",
  },
  {
    id: "CB-2073",
    customerId: "c32",
    lines: lines(["sourdough", 1], ["pumpkin", 1]),
    day: 1,
    time: t(9),
    status: "pending",
    channel: "Website",
    placedAgo: "Just now",
  },
];

export function makeHours(todayDow: number): Record<number, DayHours> {
  // Closed Mondays for baking prep. If the demo is opened on a Monday, close Tuesday instead
  // so "today" is always a live trading day.
  const closed = todayDow === 1 ? 2 : 1;
  const hours: Record<number, DayHours> = {};
  for (let d = 0; d < 7; d++) {
    hours[d] = {
      open: d !== closed,
      start: t(8),
      end: d === 6 ? t(15) : t(14),
      capacity: d === 6 || d === 0 ? 4 : 3,
    };
  }
  return hours;
}

export const TIME_OFF: TimeOff[] = [{ id: "to1", label: "Thanksgiving break", from: 29, to: 31 }];

export const NOTICES: Notice[] = [
  { id: "n1", kind: "review", title: "New 5-star review", body: "“The cardamom buns are dangerous. I’m ordering every Saturday now.” Jenna W.", ago: "18m", unread: true },
  { id: "n2", kind: "order", title: "Hannah B. wants a pickup", body: "2× Butter Croissants · Today, 12:00 PM", ago: "52m", unread: true, orderId: "CB-2051" },
  { id: "n3", kind: "noshow", title: "Tom A. didn’t pick up", body: "Seeded Rye · 8:30 AM · 2nd no-show this month", ago: "1h", unread: true, orderId: "CB-2043" },
  { id: "n4", kind: "cancel", title: "Derek L. cancelled", body: "Country Sourdough · was 10:00 AM today", ago: "3h", unread: false, orderId: "CB-2046" },
  { id: "n5", kind: "payout", title: "Payout on the way", body: "$1,284.50 to Chase ••4821 · arrives Thursday", ago: "1d", unread: false },
  { id: "n6", kind: "system", title: "Pear & Ginger Galette sold out", body: "All 6 claimed for today. Marked sold out on your site.", ago: "1d", unread: false },
];

/**
 * Daily revenue for past days, keyed by day offset (-1 = yesterday). Deterministic so the
 * charts are stable between reloads; shaped like a real bakery week (big Saturdays, quiet midweek).
 */
export function makeHistory(todayDow: number, hours: Record<number, DayHours>): Record<number, number> {
  const base: Record<number, number> = { 0: 520, 1: 0, 2: 340, 3: 365, 4: 410, 5: 560, 6: 790 };
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: Record<number, number> = {};
  for (let off = -1; off >= -35; off--) {
    const dow = (((todayDow + off) % 7) + 7) % 7;
    const growth = 1 + (35 + off) * 0.006; // gentle upward trend toward today
    const v = hours[dow].open ? base[dow] || 380 : 0;
    out[off] = v === 0 ? 0 : Math.round(v * growth * (0.82 + rand() * 0.34));
  }
  return out;
}

/** Orders per hour by weekday, for the busy-times grid (8 AM to 2 PM). */
export const BUSY: Record<number, number[]> = {
  // dow: counts for 8,9,10,11,12,13 o'clock
  0: [3, 6, 7, 5, 3, 1],
  1: [0, 0, 0, 0, 0, 0],
  2: [3, 4, 3, 2, 2, 1],
  3: [4, 4, 3, 3, 2, 1],
  4: [4, 5, 4, 3, 3, 2],
  5: [5, 6, 5, 4, 4, 2],
  6: [7, 10, 9, 6, 4, 3],
};
