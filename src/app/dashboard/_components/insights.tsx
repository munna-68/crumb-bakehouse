"use client";

import { useState } from "react";
import { clock, dayLabel, firstLast, money } from "../_lib/format";
import { COMPLETED_30D, bestSellers, busyGrid, missed, monthDots, weekBars } from "../_lib/selectors";
import { useDashboard } from "../_lib/store";
import { BusyGrid, MonthDots, TickGauge, WeekBars } from "./charts";
import { FoodGlyph, I } from "./icons";
import { itemsSummary } from "./orders";
import { Avatar, Card, Chip, Empty, Eyebrow, Segmented, Switch, cx, useCountUp } from "./ui";

export function InsightsView() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div className="lg:col-span-7">
        <RevenueCard />
      </div>
      <div className="lg:col-span-5">
        <BusyCard />
      </div>
      <div className="lg:col-span-7">
        <MissedPickups />
      </div>
      <div className="lg:col-span-5">
        <BestSellers />
      </div>
    </div>
  );
}

function RevenueCard() {
  const { state } = useDashboard();
  const [range, setRange] = useState<"week" | "last" | "month">("week");
  const bars = weekBars(state, range === "last" ? -1 : 0);
  const prev = weekBars(state, range === "last" ? -2 : -1);
  const days = monthDots(state);
  const total = range === "month" ? days.reduce((s, d) => s + d.value, 0) : bars.reduce((s, b) => s + b.value, 0);
  const booked = range === "week" ? bars.filter((b) => b.kind === "future").reduce((s, b) => s + b.value, 0) : 0;
  const compare =
    range === "month"
      ? null
      : (() => {
          // This week compares like-for-like days so a half-finished week isn't "down".
          const upto = range === "week" ? bars.findIndex((b) => b.kind === "today") + 1 : 7;
          const a = bars.slice(0, upto).reduce((s, b) => s + b.value, 0);
          const b = prev.slice(0, upto).reduce((s, x) => s + x.value, 0);
          return b ? Math.round(((a - b) / b) * 100) : 0;
        })();
  const shown = useCountUp(total);

  return (
    <Card className="p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Eyebrow>Revenue</Eyebrow>
          <p className="tnum mt-2 text-[38px] leading-none font-semibold tracking-[-0.045em] lg:text-[44px]">{money(shown)}</p>
          <p className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-3">
            {compare !== null && (
              <span className={cx("inline-flex items-center gap-0.5 font-semibold", compare >= 0 ? "text-sage" : "text-crust")}>
                <I.Trend size={14} className={compare < 0 ? "-scale-y-100" : ""} />
                {compare >= 0 ? "+" : ""}
                {compare}%
              </span>
            )}
            {range === "week" && (
              <span>
                vs last week
                {booked > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-ink-2">{money(booked)}</span> booked ahead
                  </>
                )}
              </span>
            )}
            {range === "last" && <span>vs the week before</span>}
            {range === "month" && <span>Last 30 days</span>}
          </p>
        </div>
        <Segmented
          size="sm"
          value={range}
          onChange={setRange}
          options={[
            { value: "week", label: "This week" },
            { value: "last", label: "Last week" },
            { value: "month", label: "30 days" },
          ]}
          className="w-full sm:w-auto"
        />
      </div>
      <div key={range} className="mt-6 animate-fade">
        {range === "month" ? <MonthDots days={days} height={150} /> : <WeekBars bars={bars} height={150} />}
      </div>
      {range !== "month" && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-3">
          <Legend className="bg-ink" label="Earned" />
          {range === "week" && <Legend className="bg-crust" label="Today so far" />}
          {range === "week" && <Legend className="hatch bg-paper-2 text-ink/30 ring-1 ring-line-2" label="Booked ahead" />}
        </div>
      )}
    </Card>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx("size-2.5 rounded-[3px]", className)} />
      {label}
    </span>
  );
}

function MissedPickups() {
  const { state, actions } = useDashboard();
  const list = missed(state);
  const noShows = list.filter((o) => o.status === "no_show");
  const cancels = list.filter((o) => o.status === "cancelled");
  const late = cancels.filter((o) => o.cancelReason?.includes("before pickup"));
  const rate = COMPLETED_30D / (COMPLETED_30D + noShows.length);
  const repeat = state.customers.filter((c) => noShows.filter((o) => o.customerId === c.id).length >= 2);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? list : list.slice(0, 5);

  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>No-shows & cancellations</Eyebrow>
          <p className="mt-1 text-[13px] text-ink-3">Last 30 days</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto w-[176px]">
          <TickGauge value={rate} size={176} />
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="tnum text-[30px] leading-none font-semibold tracking-[-0.04em]">{(rate * 100).toFixed(1)}%</p>
            <p className="mt-1 text-[11.5px] text-ink-3">picked up on time</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Tile value={String(noShows.length)} label="No-shows" tone="crust" />
          <Tile value={String(cancels.length)} label="Cancelled" sub={`${late.length} late`} />
          <Tile value={money(noShows.reduce((s, o) => s + o.total, 0))} label="Lost" tone="crust" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-paper/80 p-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-crust ring-1 ring-line">
          <I.Lock size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold tracking-[-0.01em]">Prepay for repeat no-shows</p>
          <p className="text-[12px] leading-snug text-ink-3">
            {repeat.length > 0
              ? `${repeat.map((c) => firstLast(c.name)).join(" & ")} would pay upfront next time.`
              : "Anyone who misses two pickups pays upfront next time."}
          </p>
        </div>
        <Switch
          checked={state.prepayRepeat}
          onChange={(v) => {
            actions.setPrepay(v);
            actions.toast({
              id: "prepay",
              tone: v ? "success" : "neutral",
              title: v ? "Prepay is on" : "Prepay is off",
              body: v ? `${repeat.length} customers will pay at checkout from now on.` : "Everyone can pay at pickup again.",
            });
          }}
          label="Prepay for repeat no-shows"
        />
      </div>

      {list.length === 0 ? (
        <Empty icon={<I.Check size={22} />} title="No missed pickups" body="Every order in the last 30 days was picked up." />
      ) : (
        <ul className="mt-4 divide-y divide-line/70">
          {visible.map((o) => {
            const c = state.customers.find((x) => x.id === o.customerId)!;
            const isRepeat = repeat.some((r) => r.id === c.id);
            return (
              <li key={o.id}>
                <button
                  onClick={() => actions.open({ kind: "order", id: o.id })}
                  className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-[14px] px-2 py-3 text-left transition hover:bg-paper-2/40"
                >
                  <Avatar name={c.name} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-semibold">{c.name}</span>
                      {isRepeat && (
                        <span className="shrink-0 rounded-full bg-crust-soft px-1.5 py-px text-[10px] font-semibold text-crust">
                          ×2
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-ink-3">
                      {itemsSummary(o, state.menu)} · {dayLabel(state.today, o.day)}, {clock(o.time)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="tnum text-[13px] font-semibold">{money(o.total)}</span>
                    <Chip tone={o.status === "no_show" ? "crust" : "rose"} className="!h-5 !px-2 !text-[10.5px]">
                      {o.status === "no_show" ? "No-show" : o.cancelReason?.includes("before pickup") ? "Late cancel" : "Cancelled"}
                    </Chip>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-full py-2 text-[12.5px] font-medium text-ink-2 transition hover:bg-paper-2/50"
        >
          {showAll ? "Show less" : `Show all ${list.length}`}
          <I.ChevronDown size={14} className={cx("transition-transform", showAll && "rotate-180")} />
        </button>
      )}
    </Card>
  );
}

function Tile({ value, label, sub, tone }: { value: string; label: string; sub?: string; tone?: "crust" }) {
  return (
    <div className="rounded-[16px] bg-paper/80 px-3 py-3">
      <p className={cx("tnum text-[20px] font-semibold tracking-[-0.03em]", tone === "crust" && "text-crust")}>{value}</p>
      <p className="text-[11.5px] text-ink-3">
        {label}
        {sub && <span className="text-ink-4"> · {sub}</span>}
      </p>
    </div>
  );
}

function BusyCard() {
  const { state } = useDashboard();
  const grid = busyGrid(state);
  let peak = { dow: 6, h: 1, c: 0 };
  grid.forEach((g) => g.counts.forEach((c, h) => c > peak.c && (peak = { dow: g.dow, h, c })));
  const peakHour = 8 + peak.h;
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][peak.dow];

  return (
    <Card className="p-5 lg:h-full lg:p-6">
      <Eyebrow>Busy times</Eyebrow>
      <p className="mt-2 text-[17px] leading-snug font-semibold tracking-[-0.02em]">
        {dayName}s {peakHour > 12 ? peakHour - 12 : peakHour}–{peakHour + 1 > 12 ? peakHour - 11 : peakHour + 1}{" "}
        {peakHour + 1 >= 12 ? "PM" : "AM"} is your rush.
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
        You average {peak.c} pickups that hour. A second slot or a pre-boxed shelf would keep the line moving.
      </p>
      <div className="mt-5">
        <BusyGrid grid={grid} />
      </div>
    </Card>
  );
}

function BestSellers() {
  const { state } = useDashboard();
  const list = bestSellers(state).slice(0, 5);
  const max = Math.max(...list.map((l) => l.revenue), 1);
  return (
    <Card className="p-5 lg:h-full lg:p-6">
      <div className="flex items-center justify-between">
        <Eyebrow>Best sellers · this week</Eyebrow>
        <span className="text-[11.5px] text-ink-3">by revenue</span>
      </div>
      <ul className="mt-4 flex flex-col gap-3.5">
        {list.map((x, i) => (
          <li key={x.item.id} className="flex items-center gap-3">
            <span className="tnum w-4 text-[12px] font-semibold text-ink-4">{i + 1}</span>
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-paper text-ink-2">
              <FoodGlyph glyph={x.item.glyph} size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13.5px] font-medium">{x.item.name}</p>
                <p className="tnum shrink-0 text-[13px] font-semibold">{money(x.revenue)}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div
                    className={cx("h-full rounded-full transition-[width] duration-700", i === 0 ? "bg-crust" : "bg-ink")}
                    style={{ width: `${(x.revenue / max) * 100}%` }}
                  />
                </div>
                <span className="tnum w-12 text-right text-[11px] text-ink-3">{x.units} sold</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
