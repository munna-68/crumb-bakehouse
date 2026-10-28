"use client";

import { useState } from "react";
import { dateFor, dayLabel, dayShort, money, plural } from "../_lib/format";
import { isOpen, ordersOn } from "../_lib/selectors";
import { useDashboard } from "../_lib/store";
import type { Order } from "../_lib/types";
import { I } from "./icons";
import { RequestCard, TimelineRow } from "./orders";
import { Card, Empty, cx } from "./ui";

type Filter = "all" | "reply" | "upcoming" | "done" | "missed";

const FILTERS: { value: Filter; label: string; match: (o: Order) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "reply", label: "Needs reply", match: (o) => o.status === "pending" },
  { value: "upcoming", label: "Confirmed", match: (o) => o.status === "confirmed" || o.status === "ready" },
  { value: "done", label: "Picked up", match: (o) => o.status === "picked_up" },
  { value: "missed", label: "Missed", match: (o) => ["no_show", "cancelled", "declined"].includes(o.status) },
];

export function OrdersView() {
  const { state, actions } = useDashboard();
  const [filter, setFilter] = useState<Filter>("all");
  const day = state.ordersDay;
  const days = Array.from({ length: 7 }, (_, i) => i);
  const list = ordersOn(state, day);
  const shown = list.filter(FILTERS.find((f) => f.value === filter)!.match);
  const open = isOpen(state, day);
  const timeOff = state.timeOff.find((t) => day >= t.from && day <= t.to);
  const counted = list.filter((o) => !["cancelled", "declined", "no_show"].includes(o.status));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
      <div className="min-w-0">
        {/* Day strip */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0">
          {days.map((d) => {
            const date = dateFor(state.today, d);
            const n = ordersOn(state, d).filter((o) => !["cancelled", "declined"].includes(o.status)).length;
            const closed = !isOpen(state, d);
            const active = d === day;
            const hasPending = ordersOn(state, d).some((o) => o.status === "pending");
            return (
              <button
                key={d}
                onClick={() => actions.setOrdersDay(d)}
                className={cx(
                  "relative flex w-[60px] shrink-0 flex-col items-center rounded-[22px] py-2.5 transition-[background-color,color,transform] duration-300 active:scale-95 lg:w-auto",
                  active ? "bg-ink text-white shadow-float" : "bg-surface ring-1 ring-line/70 hover:ring-line-2",
                  closed && !active && "bg-transparent ring-dashed",
                )}
              >
                <span className={cx("text-[11px] font-medium", active ? "text-white/55" : "text-ink-3")}>
                  {d === 0 ? "Today" : dayShort(date.getDay())}
                </span>
                <span className={cx("tnum text-[21px] font-semibold tracking-[-0.03em]", closed && !active && "text-ink-4")}>
                  {date.getDate()}
                </span>
                <span className={cx("text-[10px]", active ? "text-butter" : closed ? "text-ink-4" : "text-ink-3")}>
                  {closed ? "Closed" : n === 0 ? "None" : plural(n, "order")}
                </span>
                {hasPending && !active && <span className="absolute top-2 right-2 size-1.5 rounded-full bg-crust" />}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {FILTERS.map((f) => {
            const n = list.filter(f.match).length;
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cx(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200",
                  active ? "bg-ink text-white" : "bg-surface text-ink-2 ring-1 ring-line/70 hover:text-ink",
                )}
              >
                {f.label}
                <span className={cx("tnum text-[11.5px]", active ? "text-white/55" : "text-ink-4")}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-baseline justify-between px-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{dayLabel(state.today, day, "long")}</h2>
          <span className="tnum text-[13px] text-ink-3">
            {money(counted.reduce((s, o) => s + o.total, 0))} · {plural(counted.length, "order")}
          </span>
        </div>

        <div key={`${day}-${filter}`} className="mt-3 flex flex-col gap-2.5">
          {!open && list.length === 0 ? (
            <Card>
              <Empty
                icon={<I.Lock size={22} />}
                title={timeOff ? timeOff.label : "Closed for pickups"}
                body={
                  timeOff
                    ? "You’ve blocked these days off. Customers can’t pick them at checkout."
                    : "Customers can’t choose this day. Change it any time in Menu & Hours."
                }
                action={
                  <button
                    onClick={() => actions.setTab("shop")}
                    className="h-9 rounded-full bg-surface px-4 text-[13px] font-medium ring-1 ring-line transition hover:bg-surface-2"
                  >
                    Edit hours
                  </button>
                }
              />
            </Card>
          ) : shown.length === 0 ? (
            <Card>
              <Empty
                icon={<I.Orders size={22} />}
                title={filter === "all" ? "No orders yet" : "Nothing here"}
                body={
                  filter === "all"
                    ? "Orders for this day will show up here as customers book."
                    : "No orders match this filter for the selected day."
                }
              />
            </Card>
          ) : (
            shown.map((o, i) =>
              o.status === "pending" ? (
                <div key={o.id} className="sm:pl-[64px]">
                  <RequestCard order={o} index={i} />
                </div>
              ) : (
                <TimelineRow key={o.id} order={o} index={i} />
              ),
            )
          )}
        </div>
      </div>

      <WeekSummary />
    </div>
  );
}

function WeekSummary() {
  const { state, actions } = useDashboard();
  const upcoming = state.orders.filter((o) => o.day >= 0 && o.day < 7);
  const live = upcoming.filter((o) => o.status === "confirmed" || o.status === "pending" || o.status === "ready");
  const cakes = live.filter((o) => o.lines.some((l) => l.itemId === "cake"));
  const prep: Record<string, number> = {};
  for (const o of live.filter((o) => o.day === 1))
    for (const l of o.lines) prep[l.itemId] = (prep[l.itemId] ?? 0) + l.qty;

  return (
    <aside className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="font-mono text-[10.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Tomorrow’s bake list</p>
        {Object.keys(prep).length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-3">Nothing booked for tomorrow yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/70">
            {Object.entries(prep)
              .sort((a, b) => b[1] - a[1])
              .map(([id, qty]) => (
                <li key={id} className="flex items-center justify-between py-2.5 text-[13.5px]">
                  <span className="truncate">{state.menu.find((m) => m.id === id)?.name}</span>
                  <span className="tnum ml-3 rounded-full bg-paper-2 px-2 py-0.5 text-[12px] font-semibold">×{qty}</span>
                </li>
              ))}
          </ul>
        )}
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">Auto-totaled from confirmed and pending orders.</p>
      </Card>
      <Card className="p-5">
        <p className="font-mono text-[10.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Cakes this week</p>
        {cakes.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-3">No cake orders this week.</p>
        ) : (
          <ul className="mt-2 flex flex-col">
            {cakes.map((o) => {
              const c = state.customers.find((x) => x.id === o.customerId)!;
              return (
                <li key={o.id}>
                  <button
                    onClick={() => actions.open({ kind: "order", id: o.id })}
                    className="-mx-2 flex w-[calc(100%+16px)] items-start gap-3 rounded-[14px] px-2 py-2.5 text-left transition hover:bg-paper-2/50"
                  >
                    <span className="tnum mt-0.5 w-10 shrink-0 text-[12px] font-semibold text-ink-2">
                      {dayShort(dateFor(state.today, o.day).getDay())}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{c.name}</span>
                      {o.note && <span className="line-clamp-1 block text-[12px] text-ink-3">{o.note}</span>}
                    </span>
                    {o.status === "pending" && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-butter" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </aside>
  );
}
