"use client";

import { useState } from "react";
import { useDashboard } from "../_lib/store";
import { STATUS_META, clock, dayLabel, firstLast, money, period } from "../_lib/format";
import { nextOpenDays, slotsFor } from "../_lib/selectors";
import type { MenuItem, Order } from "../_lib/types";
import { FoodGlyph, I } from "./icons";
import { Avatar, Button, Chip, Eyebrow, cx } from "./ui";

const SHORT: Record<string, string> = {
  cookies: "Choc Chip Cookies",
  buns: "Morning Buns",
  croissant: "Croissants",
  cake: "Celebration Cake",
  galette: "Pear Galette",
  pumpkin: "Pumpkin Loaf",
  sourdough: "Sourdough",
  focaccia: "Focaccia",
  rye: "Seeded Rye",
};

export function itemsSummary(o: Order, menu: MenuItem[]) {
  return o.lines
    .map((l) => {
      const name = SHORT[l.itemId] ?? menu.find((m) => m.id === l.itemId)?.name ?? "Item";
      return l.qty > 1 ? `${l.qty}× ${name}` : name;
    })
    .join(", ");
}

function useOrderBits(o: Order) {
  const { state } = useDashboard();
  const customer = state.customers.find((c) => c.id === o.customerId)!;
  const firstItem = state.menu.find((m) => m.id === o.lines[0]?.itemId);
  return { state, customer, firstItem, summary: itemsSummary(o, state.menu) };
}

/* ─────────────────────────── Request card ─────────────────────────── */

export function RequestCard({ order, index = 0 }: { order: Order; index?: number }) {
  const { state, actions } = useDashboard();
  const { customer, summary } = useOrderBits(order);
  const [leaving, setLeaving] = useState<null | "confirmed" | "declined">(null);

  const resolve = (status: "confirmed" | "declined") => {
    setLeaving(status);
    setTimeout(() => actions.setStatus(order.id, status), 820);
  };

  return (
    <div className="collapse-row" data-collapsed={leaving ? "true" : "false"} style={{ transitionDelay: leaving ? "380ms" : "0ms" }}>
      <div>
        <article
          className={cx(
            "relative rounded-[22px] bg-surface p-4 shadow-card ring-1 ring-line/70 animate-rise",
            order.fresh && "animate-flash",
          )}
          style={{ animationDelay: order.fresh ? "0ms" : `${index * 60}ms` }}
        >
          <button
            onClick={() => actions.open({ kind: "order", id: order.id })}
            className="absolute inset-0 rounded-[22px]"
            aria-label={`Open order from ${customer.name}`}
          />
          <div className="pointer-events-none relative flex items-start gap-3">
            <Avatar name={customer.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold tracking-[-0.015em]">{customer.name}</p>
                {customer.tag && (
                  <span className="shrink-0 rounded-full bg-paper-2 px-1.5 py-px text-[10.5px] font-medium text-ink-2">
                    {customer.tag}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[13px] text-ink-2">{summary}</p>
            </div>
            <p className="tnum text-[15px] font-semibold tracking-[-0.01em]">{money(order.total)}</p>
          </div>

          <div className="pointer-events-none relative mt-3 flex flex-wrap items-center gap-1.5">
            <Chip tone="outline">
              <I.Clock size={12} />
              {dayLabel(state.today, order.day)} · {clock(order.time)}
            </Chip>
            {order.note && (
              <Chip tone="muted" className="max-w-[60%]">
                <I.Note size={12} />
                <span className="truncate">{order.note}</span>
              </Chip>
            )}
            {order.fresh && (
              <Chip tone="crust">
                <span className="size-1.5 rounded-full bg-white animate-pulse-ring" />
                New
              </Chip>
            )}
          </div>

          <div className="relative mt-4 grid grid-cols-[auto_auto_1fr] gap-2">
            <Button
              variant="danger"
              size="md"
              onClick={() => resolve("declined")}
              disabled={!!leaving}
              aria-label="Decline"
              className="px-3.5"
            >
              <I.X size={16} />
              <span className="hidden sm:inline">Decline</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => actions.open({ kind: "reschedule", id: order.id })}
              disabled={!!leaving}
              className="px-3.5"
            >
              <I.Move size={16} />
              Reschedule
            </Button>
            <Button
              variant="primary"
              onClick={() => resolve("confirmed")}
              disabled={!!leaving && leaving !== "confirmed"}
              className={cx(
                "transition-[background-color,transform] duration-300",
                leaving === "confirmed" && "!bg-sage !opacity-100",
                leaving === "declined" && "!bg-rose !opacity-100",
              )}
            >
              {leaving === "confirmed" ? (
                <>
                  <I.Check size={16} className="animate-[rise_0.3s_var(--ease-spring)_both]" /> Confirmed
                </>
              ) : leaving === "declined" ? (
                <>Declined</>
              ) : (
                <>
                  <I.Check size={16} /> Confirm
                </>
              )}
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}

/* ─────────────────────────── Timeline row ─────────────────────────── */

export function TimelineRow({ order, showTime = true, index = 0 }: { order: Order; showTime?: boolean; index?: number }) {
  const { state, actions } = useDashboard();
  const { customer, firstItem, summary } = useOrderBits(order);
  const meta = STATUS_META[order.status];
  const past = order.day === 0 && order.time < state.now - 20;
  const muted = order.status === "picked_up" || order.status === "cancelled" || order.status === "declined";
  const isNow = order.day === 0 && Math.abs(order.time - state.now) <= 15 && (order.status === "ready" || order.status === "confirmed");

  let quick: React.ReactNode = null;
  if (order.status === "confirmed" && !past)
    quick = (
      <QuickAction onClick={() => actions.setStatus(order.id, "ready")} label="Mark ready">
        Mark ready
      </QuickAction>
    );
  else if (order.status === "ready" || (order.status === "confirmed" && past))
    quick = (
      <QuickAction onClick={() => actions.setStatus(order.id, "picked_up")} label="Mark picked up" strong>
        <I.Check size={14} /> Picked up
      </QuickAction>
    );
  else if (order.status === "pending")
    quick = (
      <QuickAction onClick={() => actions.setStatus(order.id, "confirmed")} label="Confirm" strong>
        <I.Check size={14} /> Confirm
      </QuickAction>
    );

  return (
    <div className="flex gap-3 animate-rise" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      {showTime && (
        <div className="w-[52px] shrink-0 pt-3.5 text-right">
          <p className={cx("tnum text-[15px] font-semibold tracking-[-0.02em]", muted && "text-ink-3")}>
            {clock(order.time, false)}
          </p>
          <p className="font-mono text-[9.5px] tracking-wider text-ink-4">{period(order.time)}</p>
        </div>
      )}
      <article
        className={cx(
          "relative min-w-0 flex-1 rounded-[20px] p-3.5 transition-[background-color,box-shadow] duration-500",
          muted ? "bg-surface/55 ring-1 ring-line/60" : "bg-surface shadow-card ring-1 ring-line/70",
          isNow && "ring-2 ring-ink",
          order.fresh && "animate-flash",
        )}
      >
        <button
          onClick={() => actions.open({ kind: "order", id: order.id })}
          className="absolute inset-0 rounded-[20px]"
          aria-label={`Open order from ${customer.name}`}
        />
        <div className="pointer-events-none relative flex items-center gap-3">
          <span
            className={cx(
              "grid size-10 shrink-0 place-items-center rounded-full transition-colors",
              muted ? "bg-paper-2/70 text-ink-3" : "bg-paper text-ink-2",
            )}
          >
            {firstItem ? <FoodGlyph glyph={firstItem.glyph} size={24} /> : <I.Orders size={18} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cx("flex items-center gap-1.5 text-[14.5px] font-semibold tracking-[-0.015em]", muted && "text-ink-2")}>
              <span className="truncate">{customer.name}</span>
              {customer.allergy && !muted && (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-rose-soft px-1.5 py-px text-[10px] font-semibold text-rose">
                  <I.Alert size={11} /> {customer.allergy}
                </span>
              )}
            </p>
            <p className={cx("truncate text-[12.5px]", muted ? "text-ink-3" : "text-ink-2")}>{summary}</p>
          </div>
          <p className={cx("tnum text-[14px] font-semibold", muted ? "text-ink-3" : "text-ink", order.status === "cancelled" && "line-through")}>
            {money(order.total)}
          </p>
        </div>
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <div className="pointer-events-none flex min-w-0 items-center gap-1.5">
            <Chip tone={meta.tone} dot={order.status === "confirmed" || order.status === "pending"}>
              {meta.label}
            </Chip>
            {isNow && <Chip tone="outline">Due now</Chip>}
            {order.note && !muted && <I.Note size={15} className="shrink-0 text-ink-3" aria-label="Has a note" />}
          </div>
          {quick}
        </div>
      </article>
    </div>
  );
}

function QuickAction({
  children,
  onClick,
  label,
  strong,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  strong?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cx(
        "relative z-10 inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-medium transition-[background-color,transform] duration-200 active:scale-95",
        strong ? "bg-ink text-white hover:bg-[#2c2a27]" : "bg-paper-2 text-ink hover:bg-line",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Order detail sheet ─────────────────────────── */

export function OrderDetail({ id }: { id: string }) {
  const { state, actions } = useDashboard();
  const order = state.orders.find((o) => o.id === id);
  if (!order) return null;
  const customer = state.customers.find((c) => c.id === order.customerId)!;
  const meta = STATUS_META[order.status];
  const past = order.day < 0 || (order.day === 0 && order.time < state.now);
  const repeatNoShow = customer.noShows >= 2;

  return (
    <div className="px-5 lg:px-6">
      <div className="flex items-center gap-3.5">
        <Avatar name={customer.name} size={52} />
        <div className="min-w-0">
          <h3 className="truncate text-[22px] font-semibold tracking-[-0.025em]">{customer.name}</h3>
          <p className="tnum text-[13px] text-ink-3">{customer.phone}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`sms:${customer.phone.replace(/\D/g, "")}`}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface text-[13px] font-medium ring-1 ring-line transition hover:bg-surface-2"
        >
          <I.Note size={16} /> Text
        </a>
        <a
          href={`tel:${customer.phone.replace(/\D/g, "")}`}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface text-[13px] font-medium ring-1 ring-line transition hover:bg-surface-2"
        >
          <I.Phone size={16} /> Call
        </a>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] bg-surface ring-1 ring-line/70">
        <div className="grid grid-cols-2 divide-x divide-line border-b border-line">
          <div className="p-4">
            <Eyebrow>Pickup</Eyebrow>
            <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em]">{dayLabel(state.today, order.day, "long")}</p>
            <p className="tnum text-[13px] text-ink-2">{clock(order.time)}</p>
          </div>
          <div className="p-4">
            <Eyebrow>Status</Eyebrow>
            <div className="mt-2">
              <Chip tone={meta.tone} dot>
                {meta.label}
              </Chip>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-3">
              {order.channel}
              {order.placedAgo && ` · ${order.placedAgo}`}
            </p>
          </div>
        </div>
        <ul className="divide-y divide-line/70 px-4">
          {order.lines.map((l) => {
            const item = state.menu.find((m) => m.id === l.itemId);
            if (!item) return null;
            return (
              <li key={l.itemId} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-[12px] bg-paper text-ink-2">
                  <FoodGlyph glyph={item.glyph} size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{item.name}</p>
                  <p className="tnum text-[12px] text-ink-3">
                    {l.qty} × {money(item.price)}
                  </p>
                </div>
                <p className="tnum text-[14px] font-medium">{money(item.price * l.qty)}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-3">
          <span className="text-[13px] text-ink-2">Paid online</span>
          <span className="tnum text-[17px] font-semibold tracking-[-0.02em]">{money(order.total, true)}</span>
        </div>
      </div>

      {order.note && (
        <div className="mt-3 rounded-[18px] bg-butter-soft px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#8a6a0c] uppercase">
            <I.Note size={13} /> Note from {customer.name.split(" ")[0]}
          </p>
          <p className="mt-1 text-[14px] leading-snug text-ink">{order.note}</p>
        </div>
      )}
      {order.cancelReason && (
        <div className="mt-3 rounded-[18px] bg-rose-soft px-4 py-3 text-[13.5px] text-rose">{order.cancelReason}</div>
      )}

      <div className="mt-3 rounded-[22px] bg-surface p-4 ring-1 ring-line/70">
        <div className="flex items-center justify-between">
          <Eyebrow>Customer</Eyebrow>
          <span className="text-[12px] text-ink-3">Since {customer.since}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Orders" value={String(customer.orders)} />
          <Stat label="Spent" value={money(customer.spent)} />
          <Stat label="No-shows" value={String(customer.noShows)} warn={customer.noShows > 0} />
        </div>
        {(customer.allergy || repeatNoShow || customer.tag) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {customer.tag && <Chip tone="muted">{customer.tag}</Chip>}
            {customer.allergy && (
              <Chip tone="rose">
                <I.Alert size={12} /> Allergy: {customer.allergy}
              </Chip>
            )}
            {repeatNoShow && (
              <Chip tone="crust">
                <I.Alert size={12} /> Repeat no-show
                {state.prepayRepeat && " · prepay required"}
              </Chip>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-5 bg-gradient-to-t from-paper via-paper to-paper/0 px-5 pt-4 lg:-mx-6 lg:px-6">
        <OrderActions order={order} past={past} onDone={actions.close} />
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-[14px] bg-paper/70 px-3 py-2.5">
      <p className={cx("tnum text-[16px] font-semibold tracking-[-0.02em]", warn && "text-crust")}>{value}</p>
      <p className="text-[11px] text-ink-3">{label}</p>
    </div>
  );
}

function OrderActions({ order, past, onDone }: { order: Order; past: boolean; onDone: () => void }) {
  const { actions } = useDashboard();
  const act = (s: Parameters<typeof actions.setStatus>[1]) => {
    actions.setStatus(order.id, s);
    onDone();
  };
  const reschedule = (
    <Button variant="secondary" size="lg" onClick={() => actions.open({ kind: "reschedule", id: order.id })}>
      <I.Move size={17} /> Reschedule
    </Button>
  );
  switch (order.status) {
    case "pending":
      return (
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
          <Button variant="danger" size="lg" onClick={() => act("declined")} aria-label="Decline" className="px-4">
            <I.X size={17} />
          </Button>
          {reschedule}
          <Button variant="primary" size="lg" onClick={() => act("confirmed")}>
            <I.Check size={17} /> Confirm
          </Button>
        </div>
      );
    case "confirmed":
      return past ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="lg" onClick={() => act("no_show")}>
            No-show
          </Button>
          <Button variant="primary" size="lg" onClick={() => act("picked_up")}>
            <I.Check size={17} /> Picked up
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {reschedule}
          <Button variant="primary" size="lg" onClick={() => act("ready")}>
            Mark ready
          </Button>
        </div>
      );
    case "ready":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="lg" onClick={() => act("no_show")}>
            No-show
          </Button>
          <Button variant="primary" size="lg" onClick={() => act("picked_up")}>
            <I.Check size={17} /> Picked up
          </Button>
        </div>
      );
    case "no_show":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={() => act("picked_up")}>
            They came after all
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              actions.toast({ tone: "neutral", title: "Reminder sent", body: "We texted them a link to rebook." });
              onDone();
            }}
          >
            Send rebook link
          </Button>
        </div>
      );
    default:
      return (
        <Button variant="secondary" size="lg" className="w-full" onClick={onDone}>
          Done
        </Button>
      );
  }
}

/* ─────────────────────────── Reschedule sheet ─────────────────────────── */

export function Reschedule({ id }: { id: string }) {
  const { state, actions } = useDashboard();
  const order = state.orders.find((o) => o.id === id);
  const days = order ? nextOpenDays(state, 6, Math.max(0, order.day === 0 ? 0 : order.day - 1)) : [];
  const [day, setDay] = useState<number>(days.find((d) => d !== order?.day) ?? days[0] ?? 0);
  const [time, setTime] = useState<number | null>(null);
  if (!order) return null;
  const customer = state.customers.find((c) => c.id === order.customerId)!;
  const slots = slotsFor(state, day, order.id);

  return (
    <div className="px-5 lg:px-6">
      <div className="flex items-center gap-3 rounded-[18px] bg-surface p-3 ring-1 ring-line/70">
        <Avatar name={customer.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{customer.name}</p>
          <p className="truncate text-[12px] text-ink-3">
            Currently {dayLabel(state.today, order.day)}, {clock(order.time)}
          </p>
        </div>
        <span className="tnum text-[14px] font-semibold">{money(order.total)}</span>
      </div>

      <Eyebrow className="mt-5 mb-2.5">Pick a day</Eyebrow>
      {days.length === 0 ? (
        <p className="rounded-[18px] bg-surface p-4 text-[13px] text-ink-3 ring-1 ring-line/70">
          No open days in the next three weeks. Open more days in Hours to offer a new time.
        </p>
      ) : (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:-mx-6 lg:px-6">
          {days.map((d) => {
            const date = new Date(state.today);
            date.setDate(date.getDate() + d);
            const active = d === day;
            return (
              <button
                key={d}
                onClick={() => {
                  setDay(d);
                  setTime(null);
                }}
                className={cx(
                  "flex w-[62px] shrink-0 flex-col items-center rounded-[20px] py-2.5 transition-[background-color,color,transform] duration-300 active:scale-95",
                  active ? "bg-ink text-white" : "bg-surface text-ink ring-1 ring-line/70 hover:ring-line-2",
                )}
              >
                <span className={cx("text-[11px] font-medium", active ? "text-white/60" : "text-ink-3")}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}
                </span>
                <span className="tnum text-[20px] font-semibold tracking-[-0.03em]">{date.getDate()}</span>
                <span className={cx("text-[10px]", active ? "text-butter" : "text-ink-4")}>
                  {d === 0 ? "Today" : d === 1 ? "Tmrw" : `${slotsFor(state, d, order.id).reduce((a, s) => a + s.left, 0)} open`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {days.length > 0 && (
        <>
          <Eyebrow className="mt-5 mb-2.5">Pickup time</Eyebrow>
          <div key={day} className="grid grid-cols-3 gap-2 animate-fade">
            {slots.map((s) => {
              const full = s.left === 0;
              const active = time === s.time;
              return (
                <button
                  key={s.time}
                  disabled={full}
                  onClick={() => setTime(s.time)}
                  className={cx(
                    "flex h-14 flex-col items-center justify-center rounded-[16px] transition-[background-color,color,transform] duration-200 active:scale-95",
                    active ? "bg-ink text-white" : full ? "bg-paper-2/60 text-ink-4" : "bg-surface ring-1 ring-line/70 hover:ring-line-2",
                  )}
                >
                  <span className={cx("tnum text-[14px] font-semibold", full && "line-through")}>{clock(s.time)}</span>
                  <span className={cx("text-[10.5px]", active ? "text-white/60" : "text-ink-3")}>
                    {full ? "Full" : s.left === 1 ? "1 spot left" : `${s.left} spots`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-2.5 rounded-[16px] bg-sage-soft/70 px-3.5 py-3 text-[12.5px] text-[#3f6a3b]">
        <I.Note size={16} className="shrink-0" />
        <span>
          {firstLast(customer.name)} gets a text with the new time and a one-tap link to say it works.
        </span>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-4 bg-gradient-to-t from-paper via-paper to-paper/0 px-5 pt-3 lg:-mx-6 lg:px-6">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={time === null}
          onClick={() => time !== null && actions.reschedule(order.id, day, time)}
        >
          {time === null ? "Choose a time" : `Move to ${dayLabel(state.today, day)}, ${clock(time)}`}
        </Button>
      </div>
    </div>
  );
}
