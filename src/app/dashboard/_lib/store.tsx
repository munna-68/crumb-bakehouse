"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  CUSTOMERS,
  DEMO_START_MINUTES,
  INCOMING,
  MENU,
  NOTICES,
  ORDERS,
  TIME_OFF,
  makeHistory,
  makeHours,
  totalOf,
} from "./data";
import { clock, dayLabel, firstLast } from "./format";
import type { Customer, DayHours, MenuItem, Notice, Order, OrderStatus, Tab, TimeOff, Toast } from "./types";

export type Sheet =
  | { kind: "order"; id: string }
  | { kind: "reschedule"; id: string }
  | { kind: "item"; id: string | null }
  | { kind: "notifications" }
  | null;

interface State {
  ready: boolean;
  today: Date;
  startedAt: number;
  now: number;
  tab: Tab;
  menu: MenuItem[];
  orders: Order[];
  customers: Customer[];
  hours: Record<number, DayHours>;
  timeOff: TimeOff[];
  notices: Notice[];
  toasts: Toast[];
  history: Record<number, number>;
  accepting: boolean;
  prepayRepeat: boolean;
  sheet: Sheet;
  ordersDay: number;
  incomingIndex: number;
}

type Action =
  | { type: "boot"; today: Date }
  | { type: "tick"; now: number }
  | { type: "tab"; tab: Tab }
  | { type: "status"; id: string; status: OrderStatus }
  | { type: "move"; id: string; day: number; time: number }
  | { type: "arrive"; order: Order }
  | { type: "unfresh"; id: string }
  | { type: "item"; item: MenuItem }
  | { type: "removeItem"; id: string }
  | { type: "hours"; dow: number; patch: Partial<DayHours> }
  | { type: "timeOff"; list: TimeOff[] }
  | { type: "notice"; notice: Notice }
  | { type: "readNotices" }
  | { type: "toast"; toast: Toast }
  | { type: "dismiss"; id: string }
  | { type: "accepting"; value: boolean }
  | { type: "prepay"; value: boolean }
  | { type: "sheet"; sheet: Sheet }
  | { type: "ordersDay"; day: number };

function initial(): State {
  return {
    ready: false,
    today: new Date(),
    startedAt: 0,
    now: DEMO_START_MINUTES,
    tab: "today",
    menu: MENU,
    orders: ORDERS,
    customers: CUSTOMERS,
    hours: makeHours(1),
    timeOff: TIME_OFF,
    notices: NOTICES,
    toasts: [],
    history: {},
    accepting: true,
    prepayRepeat: false,
    sheet: null,
    ordersDay: 0,
    incomingIndex: 0,
  };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "boot": {
      const hours = makeHours(a.today.getDay());
      return { ...s, ready: true, today: a.today, hours, history: makeHistory(a.today.getDay(), hours), startedAt: Date.now() };
    }
    case "tick":
      return a.now === s.now ? s : { ...s, now: a.now };
    case "tab":
      return { ...s, tab: a.tab };
    case "status":
      return { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: a.status } : o)) };
    case "move":
      return {
        ...s,
        orders: s.orders.map((o) =>
          o.id === a.id ? { ...o, day: a.day, time: a.time, status: o.status === "pending" ? "confirmed" : o.status } : o,
        ),
      };
    case "arrive":
      return { ...s, orders: [a.order, ...s.orders], incomingIndex: s.incomingIndex + 1 };
    case "unfresh":
      return { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, fresh: false } : o)) };
    case "item": {
      const exists = s.menu.some((m) => m.id === a.item.id);
      return { ...s, menu: exists ? s.menu.map((m) => (m.id === a.item.id ? a.item : m)) : [...s.menu, a.item] };
    }
    case "removeItem":
      return { ...s, menu: s.menu.filter((m) => m.id !== a.id) };
    case "hours":
      return { ...s, hours: { ...s.hours, [a.dow]: { ...s.hours[a.dow], ...a.patch } } };
    case "timeOff":
      return { ...s, timeOff: a.list };
    case "notice":
      return { ...s, notices: [a.notice, ...s.notices] };
    case "readNotices":
      return { ...s, notices: s.notices.map((n) => ({ ...n, unread: false })) };
    case "toast":
      return { ...s, toasts: [...s.toasts.filter((t) => t.id !== a.toast.id), a.toast].slice(-3) };
    case "dismiss":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "accepting":
      return { ...s, accepting: a.value };
    case "prepay":
      return { ...s, prepayRepeat: a.value };
    case "sheet":
      return { ...s, sheet: a.sheet };
    case "ordersDay":
      return { ...s, ordersDay: a.day };
  }
}

let uid = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${uid++}`;

function useDashboardState() {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Boot on the client only: the demo is anchored to the viewer's real "today".
  // A short beat of skeletons makes the load feel like a real app fetching data.
  useEffect(() => {
    const id = setTimeout(() => dispatch({ type: "boot", today: new Date() }), 750);
    return () => clearTimeout(id);
  }, []);

  // Demo clock: starts at 10:42 AM and advances in real time.
  useEffect(() => {
    if (!state.ready) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - stateRef.current.startedAt) / 60000;
      dispatch({ type: "tick", now: Math.floor(DEMO_START_MINUTES + elapsed) });
    }, 5000);
    return () => clearInterval(id);
  }, [state.ready]);

  const toast = useCallback((t: Omit<Toast, "id"> & { id?: string }) => {
    const id = t.id ?? nextId("t");
    dispatch({ type: "toast", toast: { ...t, id } });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => dispatch({ type: "dismiss", id }), []);

  const customer = useCallback((id: string) => stateRef.current.customers.find((c) => c.id === id)!, []);

  const setStatus = useCallback(
    (id: string, status: OrderStatus, opts?: { quiet?: boolean }) => {
      const order = stateRef.current.orders.find((o) => o.id === id);
      if (!order) return;
      const prev = order.status;
      dispatch({ type: "status", id, status });
      if (opts?.quiet) return;
      const who = firstLast(customer(order.customerId).name);
      const undo = () => dispatch({ type: "status", id, status: prev });
      const copy: Partial<Record<OrderStatus, Omit<Toast, "id">>> = {
        confirmed: { tone: "success", title: `Confirmed ${who}`, body: "They’ll get a text with pickup details.", undo },
        declined: { tone: "danger", title: `Declined ${who}`, body: "They’ve been notified and refunded.", undo },
        ready: { tone: "success", title: `${who}’s order is ready`, body: "Pickup reminder sent.", undo },
        picked_up: { tone: "neutral", title: `${who} picked up`, body: "Nice. Payment settled.", undo },
        no_show: { tone: "danger", title: `Marked ${who} as no-show`, body: "Added to your missed pickups.", undo },
      };
      const c = copy[status];
      if (c) toast({ ...c, id: `status-${id}` });
    },
    [customer, toast],
  );

  const reschedule = useCallback(
    (id: string, day: number, time: number) => {
      const s = stateRef.current;
      const order = s.orders.find((o) => o.id === id);
      if (!order) return;
      const prev = { day: order.day, time: order.time, status: order.status };
      dispatch({ type: "move", id, day, time });
      dispatch({ type: "sheet", sheet: null });
      toast({
        id: `status-${id}`,
        tone: "success",
        title: `Moved to ${dayLabel(s.today, day)}, ${clock(time)}`,
        body: `${firstLast(customer(order.customerId).name)} got a text with the new time.`,
        undo: () => {
          dispatch({ type: "move", id, day: prev.day, time: prev.time });
          dispatch({ type: "status", id, status: prev.status });
        },
      });
    },
    [customer, toast],
  );

  const arriveNext = useCallback(() => {
    const s = stateRef.current;
    const seed = INCOMING[s.incomingIndex];
    if (!seed || !s.accepting) return;
    const order: Order = { ...seed, total: totalOf(seed.lines), fresh: true };
    const c = s.customers.find((x) => x.id === order.customerId)!;
    dispatch({ type: "arrive", order });
    dispatch({
      type: "notice",
      notice: {
        id: nextId("n"),
        kind: "order",
        title: `${firstLast(c.name)} wants a pickup`,
        body: `${order.lines.map((l) => `${l.qty}× ${s.menu.find((m) => m.id === l.itemId)?.name}`).join(", ")} · ${dayLabel(s.today, order.day)}, ${clock(order.time)}`,
        ago: "now",
        unread: true,
        orderId: order.id,
      },
    });
    toast({ id: `incoming-${order.id}`, tone: "incoming", title: c.name, orderId: order.id });
    setTimeout(() => dispatch({ type: "unfresh", id: order.id }), 4500);
  }, [toast]);

  // The live moment: a new order lands a few seconds after the dashboard loads,
  // then occasionally after that.
  useEffect(() => {
    if (!state.ready) return;
    const first = setTimeout(arriveNext, 6500);
    const more = setInterval(arriveNext, 55000);
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) arriveNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(first);
      clearInterval(more);
      window.removeEventListener("keydown", onKey);
    };
  }, [state.ready, arriveNext]);

  const actions = useMemo(
    () => ({
      dispatch,
      toast,
      dismiss,
      setStatus,
      reschedule,
      arriveNext,
      setTab: (tab: Tab) => dispatch({ type: "tab", tab }),
      open: (sheet: Sheet) => dispatch({ type: "sheet", sheet }),
      close: () => dispatch({ type: "sheet", sheet: null }),
      saveItem: (item: MenuItem) => dispatch({ type: "item", item }),
      removeItem: (id: string) => dispatch({ type: "removeItem", id }),
      setHours: (dow: number, patch: Partial<DayHours>) => dispatch({ type: "hours", dow, patch }),
      setTimeOff: (list: TimeOff[]) => dispatch({ type: "timeOff", list }),
      readNotices: () => dispatch({ type: "readNotices" }),
      setAccepting: (value: boolean) => dispatch({ type: "accepting", value }),
      setPrepay: (value: boolean) => dispatch({ type: "prepay", value }),
      setOrdersDay: (day: number) => dispatch({ type: "ordersDay", day }),
    }),
    [toast, dismiss, setStatus, reschedule, arriveNext],
  );

  return { state, actions };
}

type Ctx = ReturnType<typeof useDashboardState>;
const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const value = useDashboardState();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
