"use client";

import { useState } from "react";
import { BUSINESS } from "../_lib/data";
import { greeting, money, plural } from "../_lib/format";
import { COMPLETED_30D, missed, ordersOn, todayStats, weekBars } from "../_lib/selectors";
import { useDashboard } from "../_lib/store";
import { DayTimeline, DotDigits, WeekBars } from "./charts";
import { I } from "./icons";
import { RequestCard, TimelineRow } from "./orders";
import { NoticeList } from "./shell";
import { Card, Empty, Eyebrow, SectionTitle, cx, useCountUp } from "./ui";

export function TodayView() {
  const { state } = useDashboard();
  const stats = todayStats(state);
  const pendingSorted = [...stats.pending].sort((a, b) => a.day - b.day || a.time - b.time);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <Greeting pending={stats.pending.length} remaining={stats.remaining.length} />

      <div className="lg:col-span-5">
        <Hero />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:col-span-7 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
        <WeekCard />
        <MissedCard />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-7 lg:gap-5">
        <section className="mt-2 lg:mt-0">
          <SectionTitle
            title="Needs your reply"
            count={pendingSorted.length || undefined}
            className="mb-3 px-1"
            action={
              pendingSorted.length > 0 ? (
                <span className="text-[12px] text-ink-3">Customers hear back in seconds</span>
              ) : undefined
            }
          />
          {pendingSorted.length === 0 ? (
            <Card>
              <Empty
                icon={<I.Check size={22} />}
                title="You’re all caught up"
                body="New requests land here the moment a customer orders. We’ll ping you too."
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingSorted.map((o, i) => (
                <RequestCard key={o.id} order={o} index={i} />
              ))}
            </div>
          )}
        </section>

        <UpNext />
      </div>

      <aside className="hidden flex-col gap-5 lg:col-span-5 lg:flex">
        <ActivityCard />
        <SoldOutHint />
      </aside>
    </div>
  );
}

function Greeting({ pending, remaining }: { pending: number; remaining: number }) {
  const { state } = useDashboard();
  return (
    <div className="px-1 pt-1 lg:col-span-12 lg:hidden">
      <h1 className="font-serif text-[40px] leading-[1.02] tracking-[-0.01em]">
        {greeting(state.now)}, <span className="italic">{BUSINESS.firstName}.</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-2">
        {pending > 0 ? (
          <>
            <span className="font-semibold text-ink">{plural(pending, "order")}</span> need a reply ·{" "}
          </>
        ) : null}
        {plural(remaining, "pickup")} left today
      </p>
    </div>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero() {
  const { state } = useDashboard();
  const stats = todayStats(state);
  const expected = useCountUp(stats.expected);
  const collected = useCountUp(stats.collected);
  const h = state.hours[state.today.getDay()];
  const today = ordersOn(state, 0);

  return (
    <section className="relative overflow-clip rounded-[28px] bg-ink p-5 text-white shadow-float lg:h-full lg:p-6">
      <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-crust/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <Eyebrow className="text-white/45">Expected today</Eyebrow>
        <span className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/75">
          <span className={cx("size-1.5 rounded-full", state.accepting ? "bg-[#9cc595]" : "bg-crust")} />
          {state.accepting ? "Taking orders" : "Paused"}
        </span>
      </div>

      <div className="relative mt-5 mb-1 flex items-start gap-2.5">
        <span className="mt-0.5 font-serif text-[34px] leading-none text-[#f6f1e4]/60 italic">$</span>
        <DotDigits
          text={expected.toLocaleString("en-US")}
          dot={10.5}
          gap={3.4}
          on="#f6f1e4"
          off="#ffffff"
          offOpacity={0.07}
          label={`${money(stats.expected)} expected today`}
          className="h-auto max-w-[calc(100%-32px)]"
        />
      </div>

      <div className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3">
        <MiniStat label="Collected" value={money(collected)} />
        <MiniStat label="Orders" value={String(stats.count)} className="pl-4" />
        <MiniStat label="Still to come" value={String(stats.remaining.length)} className="pl-4" />
      </div>

      <div className="relative mt-5">
        <DayTimeline orders={today} start={h.start} end={h.end} now={state.now} />
      </div>
    </section>
  );
}

function MiniStat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="tnum text-[18px] font-semibold tracking-[-0.02em]">{value}</p>
      <p className="text-[11.5px] text-white/45">{label}</p>
    </div>
  );
}

/* ─────────────────────────── Week + missed cards ─────────────────────────── */

function WeekCard() {
  const { state, actions } = useDashboard();
  const bars = weekBars(state, 0);
  const last = weekBars(state, -1);
  const todayIdx = bars.findIndex((b) => b.kind === "today");
  const soFar = bars.slice(0, todayIdx + 1).reduce((s, b) => s + b.value, 0);
  const lastSoFar = last.slice(0, todayIdx + 1).reduce((s, b) => s + b.value, 0);
  const delta = lastSoFar ? Math.round(((soFar - lastSoFar) / lastSoFar) * 100) : 0;
  const total = useCountUp(soFar);

  return (
    <Card as="div" className="relative flex flex-col p-4 lg:p-5">
      <button className="absolute inset-0 z-0 rounded-[22px]" aria-label="Open insights" onClick={() => actions.setTab("insights")} />
      <div className="pointer-events-none relative flex items-start justify-between">
        <Eyebrow>This week</Eyebrow>
        <I.ArrowUpRight size={16} className="text-ink-4" />
      </div>
      <p className="tnum pointer-events-none relative mt-2 text-[24px] font-semibold tracking-[-0.035em] lg:text-[30px]">
        {money(total)}
      </p>
      <p className="pointer-events-none relative mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-3">
        <span className={cx("inline-flex items-center gap-0.5 font-semibold", delta >= 0 ? "text-sage" : "text-crust")}>
          <I.Trend size={13} className={delta < 0 ? "-scale-y-100" : ""} />
          {delta >= 0 ? "+" : ""}
          {delta}%
        </span>
        <span className="hidden sm:inline">vs last week</span>
        <span className="sm:hidden">vs last</span>
      </p>
      <div className="pointer-events-none relative mt-auto pt-4">
        <div className="lg:hidden">
          <WeekBars bars={bars} height={58} compact />
        </div>
        <div className="pointer-events-auto hidden lg:block">
          <WeekBars bars={bars} height={96} compact />
        </div>
      </div>
    </Card>
  );
}

function MissedCard() {
  const { state, actions } = useDashboard();
  const list = missed(state);
  const noShows = list.filter((o) => o.status === "no_show");
  const cancels = list.filter((o) => o.status === "cancelled");
  const rate = COMPLETED_30D / (COMPLETED_30D + noShows.length);
  const lost = noShows.reduce((s, o) => s + o.total, 0);

  return (
    <Card as="div" className="relative flex flex-col p-4 lg:p-5">
      <button className="absolute inset-0 rounded-[22px]" aria-label="Open missed pickups" onClick={() => actions.setTab("insights")} />
      <div className="pointer-events-none relative flex items-start justify-between">
        <Eyebrow>Missed · 30d</Eyebrow>
        <I.ArrowUpRight size={16} className="text-ink-4" />
      </div>
      <div className="pointer-events-none relative mt-2 flex items-baseline gap-1.5">
        <p className="tnum text-[24px] font-semibold tracking-[-0.035em] lg:text-[30px]">{noShows.length}</p>
        <p className="text-[12px] text-ink-3">no-shows</p>
      </div>
      <p className="pointer-events-none relative mt-0.5 text-[11.5px] text-ink-3">
        <span className="font-semibold text-crust">{money(lost)}</span> left on the shelf
      </p>
      <div className="pointer-events-none relative mt-auto pt-4">
        <div className="flex h-2 gap-[3px] overflow-hidden rounded-full">
          <span className="h-full rounded-full bg-ink" style={{ flex: COMPLETED_30D }} />
          <span className="h-full min-w-[6px] rounded-full bg-rose/70" style={{ flex: cancels.length * 4 }} />
          <span className="h-full min-w-[6px] rounded-full bg-crust" style={{ flex: noShows.length * 4 }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
          <span className="tnum">
            <span className="font-semibold text-ink">{(rate * 100).toFixed(1)}%</span> picked up
          </span>
          <span className="tnum hidden sm:inline">{plural(cancels.length, "cancel")}</span>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────── Up next ─────────────────────────── */

function UpNext() {
  const { state } = useDashboard();
  const [showEarlier, setShowEarlier] = useState(false);
  const list = ordersOn(state, 0).filter((o) => o.status !== "pending");
  const earlier = list.filter((o) => o.time < state.now - 20 && o.status !== "confirmed" && o.status !== "ready");
  const upcoming = list.filter((o) => !earlier.includes(o) && o.status !== "declined");

  return (
    <section className="mt-2 lg:mt-0">
      <SectionTitle
        title="Today’s pickups"
        count={upcoming.length}
        className="mb-3 px-1"
        action={
          earlier.length > 0 && (
            <button
              onClick={() => setShowEarlier((v) => !v)}
              className="flex items-center gap-1 text-[12.5px] font-medium text-ink-2 transition hover:text-ink"
            >
              {showEarlier ? "Hide" : "Show"} earlier · {earlier.length}
              <I.ChevronDown size={14} className={cx("transition-transform duration-300", showEarlier && "rotate-180")} />
            </button>
          )
        }
      />
      <div className="collapse-row mb-3" data-collapsed={showEarlier ? "false" : "true"}>
        <div>
          <div className="flex flex-col gap-2.5 pb-1">
            {showEarlier && earlier.map((o, i) => <TimelineRow key={o.id} order={o} index={i} />)}
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-2.5">
        <NowDivider />
        {upcoming.length === 0 ? (
          <Card>
            <Empty
              icon={<I.Today size={22} />}
              title="That’s a wrap for today"
              body="Every pickup is handled. Tomorrow’s orders are waiting in the Orders tab."
            />
          </Card>
        ) : (
          upcoming.map((o, i) => <TimelineRow key={o.id} order={o} index={i} />)
        )}
      </div>
    </section>
  );
}

function NowDivider() {
  const { state } = useDashboard();
  const h = Math.floor(state.now / 60);
  const m = state.now % 60;
  return (
    <div className="flex items-center gap-3">
      <span className="w-[52px] shrink-0 text-right">
        <span className="tnum rounded-full bg-crust px-2 py-0.5 text-[10.5px] font-semibold text-white">
          {(h % 12 || 12) + ":" + String(m).padStart(2, "0")}
        </span>
      </span>
      <span className="h-px flex-1 bg-crust/50" />
    </div>
  );
}

/* ─────────────────────────── Desktop rail ─────────────────────────── */

function ActivityCard() {
  const { state, actions } = useDashboard();
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between px-2 pt-2 pb-1">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Activity</h2>
        <button
          onClick={() => actions.open({ kind: "notifications" })}
          className="text-[12.5px] font-medium text-ink-3 transition hover:text-ink"
        >
          See all
        </button>
      </div>
      <NoticeList
        notices={state.notices}
        limit={6}
        onPick={(n) => n.orderId && actions.open({ kind: "order", id: n.orderId })}
      />
    </Card>
  );
}

function SoldOutHint() {
  const { state, actions } = useDashboard();
  const out = state.menu.filter((m) => !m.available);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Eyebrow>On your order page</Eyebrow>
        <button
          onClick={() => actions.setTab("shop")}
          className="flex items-center gap-1 text-[12.5px] font-medium text-ink-3 transition hover:text-ink"
        >
          Edit menu <I.ArrowRight size={14} />
        </button>
      </div>
      <p className="mt-3 text-[15px] leading-snug tracking-[-0.01em]">
        <span className="font-semibold">{state.menu.length - out.length} items</span> live
        {out.length > 0 && (
          <>
            , <span className="font-semibold text-crust">{out.length} sold out</span>
          </>
        )}
        .
      </p>
      {out.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {out.map((m) => (
            <span key={m.id} className="rounded-full bg-crust-soft px-2.5 py-1 text-[12px] font-medium text-crust">
              {m.name}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
