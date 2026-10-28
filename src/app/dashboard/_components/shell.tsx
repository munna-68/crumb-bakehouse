"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "../_lib/data";
import { clock, dayLabel, money } from "../_lib/format";
import { useDashboard } from "../_lib/store";
import type { Notice, NoticeKind, Tab, Toast } from "../_lib/types";
import { I } from "./icons";
import { itemsSummary } from "./orders";
import { Avatar, Button, Switch, cx } from "./ui";

const NAV: { tab: Tab; label: string; icon: (p: { size?: number }) => React.ReactNode }[] = [
  { tab: "today", label: "Today", icon: I.Today },
  { tab: "orders", label: "Orders", icon: I.Orders },
  { tab: "insights", label: "Insights", icon: I.Insights },
  { tab: "shop", label: "Menu & Hours", icon: I.Shop },
];

const MOBILE_LABEL: Record<Tab, string> = { today: "Today", orders: "Orders", insights: "Insights", shop: "Shop" };

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-[11px] bg-ink text-[#f6f1e4]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="font-serif text-[22px] leading-none italic" style={{ fontSize: size * 0.62, marginTop: -size * 0.06 }}>
        c
      </span>
      <span className="absolute right-[22%] bottom-[22%] size-[14%] rounded-full bg-crust" />
    </span>
  );
}

/* ─────────────────────────── Desktop sidebar ─────────────────────────── */

export function Sidebar() {
  const { state, actions } = useDashboard();
  const pending = state.orders.filter((o) => o.status === "pending" && o.day >= 0).length;
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] flex-col border-r border-line/80 bg-surface-2/60 px-4 py-5 backdrop-blur lg:flex">
      <div className="flex items-center gap-3 px-2">
        <BrandMark />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">{BUSINESS.name}</p>
          <p className="truncate text-[12px] text-ink-3">{BUSINESS.city}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-0.5" aria-label="Dashboard">
        {NAV.map(({ tab, label, icon: Icon }) => {
          const active = state.tab === tab;
          return (
            <button
              key={tab}
              onClick={() => actions.setTab(tab)}
              className={cx(
                "group flex h-10 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium tracking-[-0.01em] transition-colors duration-200",
                active ? "bg-surface text-ink shadow-card ring-1 ring-line/80" : "text-ink-2 hover:bg-paper-2/60 hover:text-ink",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} />
              <span className="flex-1 text-left">{label}</span>
              {tab === "orders" && pending > 0 && (
                <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-crust px-1.5 text-[11px] font-semibold text-white">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-[18px] bg-surface p-3.5 ring-1 ring-line/80">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold tracking-[-0.01em]">{state.accepting ? "Taking orders" : "Orders paused"}</p>
            <p className="text-[11.5px] text-ink-3">{BUSINESS.site}</p>
          </div>
          <Switch checked={state.accepting} onChange={(v) => setAccepting(actions, v)} label="Taking orders" tone="sage" />
        </div>
      </div>

      <div className="mt-auto">
        <div className="mb-4 rounded-[18px] border border-dashed border-line-2 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-3">
          Press <kbd className="rounded-[5px] bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-ink ring-1 ring-line">N</kbd> to
          simulate an incoming order.
        </div>
        <div className="flex items-center gap-3 px-2">
          <Avatar name={BUSINESS.owner} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium">{BUSINESS.owner}</p>
            <p className="text-[11.5px] text-ink-3">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function setAccepting(actions: ReturnType<typeof useDashboard>["actions"], v: boolean) {
  actions.setAccepting(v);
  actions.toast({
    id: "accepting",
    tone: v ? "success" : "neutral",
    title: v ? "You’re taking orders again" : "Orders paused",
    body: v ? "Your order page is open." : "Customers see “Back soon” on your order page.",
  });
}

/* ─────────────────────────── Top bar ─────────────────────────── */

const TITLES: Record<Tab, string> = {
  today: "Today",
  orders: "Orders",
  insights: "Insights",
  shop: "Menu & Hours",
};

export function TopBar() {
  const { state, actions } = useDashboard();
  const unread = state.notices.filter((n) => n.unread).length;
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-1 bg-paper/85 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-0 lg:bg-transparent lg:px-0 lg:pt-7 lg:pb-5 lg:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden">
          <BrandMark size={34} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14.5px] font-semibold tracking-[-0.02em]">{BUSINESS.name}</p>
            <p className="tnum truncate text-[11.5px] text-ink-3">
              {state.today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
              {clock(state.now)}
            </p>
          </div>
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="tnum text-[12.5px] text-ink-3">
            {fullDate(state.today)} · {clock(state.now)}
          </p>
          <h1 className="text-[26px] font-semibold tracking-[-0.035em]">{TITLES[state.tab]}</h1>
        </div>
        <button
          onClick={() => setAccepting(actions, !state.accepting)}
          className={cx(
            "hidden h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors sm:flex",
            state.accepting ? "bg-surface text-ink ring-line" : "bg-crust-soft text-crust ring-crust/20",
          )}
        >
          <span className={cx("relative size-2 rounded-full", state.accepting ? "bg-sage" : "bg-crust")}>
            {state.accepting && <span className="absolute inset-0 animate-ping rounded-full bg-sage opacity-60" />}
          </span>
          {state.accepting ? "Live" : "Paused"}
        </button>
        <BellButton unread={unread} onClick={() => actions.open({ kind: "notifications" })} />
        <span className="lg:hidden">
          <Avatar name={BUSINESS.owner} size={40} className="ring-2 ring-surface" />
        </span>
      </div>
    </header>
  );
}

function fullDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function BellButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  const [wiggle, setWiggle] = useState(false);
  const prev = useRef(unread);
  useEffect(() => {
    if (unread > prev.current) {
      setWiggle(true);
      const t = setTimeout(() => setWiggle(false), 900);
      prev.current = unread;
      return () => clearTimeout(t);
    }
    prev.current = unread;
  }, [unread]);
  return (
    <button
      onClick={onClick}
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className="relative grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card ring-1 ring-line transition-transform active:scale-95"
    >
      <span className={cx(wiggle && "animate-[bell_0.9s_ease-in-out]")}>
        <I.Bell size={19} />
      </span>
      {unread > 0 && (
        <span className="tnum absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-crust px-1 text-[10px] font-semibold text-white ring-2 ring-paper animate-[rise_0.4s_var(--ease-spring)_both]">
          {unread}
        </span>
      )}
      <style>{`@keyframes bell{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(9deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}}`}</style>
    </button>
  );
}

/* ─────────────────────────── Mobile tab bar ─────────────────────────── */

export function TabBar() {
  const { state, actions } = useDashboard();
  const pending = state.orders.filter((o) => o.status === "pending" && o.day >= 0).length;
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(14px,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-paper via-paper/80 to-paper/0" />
      <div className="relative mx-auto flex max-w-[420px] items-center gap-1 rounded-full bg-surface/90 p-1.5 shadow-float ring-1 ring-line/80 backdrop-blur-xl">
        {NAV.map(({ tab, icon: Icon }) => {
          const active = state.tab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                actions.setTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-current={active ? "page" : undefined}
              aria-label={MOBILE_LABEL[tab]}
              className={cx(
                "relative flex h-12 items-center justify-center gap-2 rounded-full text-[13.5px] font-medium tracking-[-0.01em] transition-[flex-grow,background-color,color] duration-500 ease-[var(--ease-out-quint)]",
                active ? "flex-[2.2] bg-ink text-white" : "flex-1 text-ink-3 hover:text-ink",
              )}
            >
              <Icon size={20} />
              <span
                className={cx(
                  "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-500 ease-[var(--ease-out-quint)]",
                  active ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                {MOBILE_LABEL[tab]}
              </span>
              {tab === "orders" && pending > 0 && !active && (
                <span className="absolute top-2.5 right-[calc(50%-14px)] size-2 rounded-full bg-crust ring-2 ring-surface" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────────────────── Notifications ─────────────────────────── */

const NOTICE_ICON: Record<NoticeKind, { icon: React.ReactNode; cls: string }> = {
  order: { icon: <I.Orders size={16} />, cls: "bg-butter-soft text-[#8a6a0c]" },
  cancel: { icon: <I.X size={16} />, cls: "bg-rose-soft text-rose" },
  noshow: { icon: <I.Alert size={16} />, cls: "bg-crust-soft text-crust" },
  review: { icon: <I.Star size={16} />, cls: "bg-sage-soft text-[#3f6a3b]" },
  payout: { icon: <I.Bank size={16} />, cls: "bg-paper-2 text-ink-2" },
  system: { icon: <I.Spark size={16} />, cls: "bg-paper-2 text-ink-2" },
};

export function NoticeList({ notices, limit, onPick }: { notices: Notice[]; limit?: number; onPick?: (n: Notice) => void }) {
  const list = limit ? notices.slice(0, limit) : notices;
  return (
    <ul className="flex flex-col">
      {list.map((n, i) => (
        <li key={n.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
          <button
            onClick={() => onPick?.(n)}
            disabled={!n.orderId}
            className="flex w-full items-start gap-3 rounded-[16px] px-2 py-3 text-left transition-colors enabled:hover:bg-paper-2/50"
          >
            <span className={cx("grid size-9 shrink-0 place-items-center rounded-full", NOTICE_ICON[n.kind].cls)}>
              {NOTICE_ICON[n.kind].icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em]">{n.title}</span>
                <span className="shrink-0 font-mono text-[10.5px] text-ink-4">{n.ago}</span>
              </span>
              <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-2">{n.body}</span>
            </span>
            {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-crust" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function NotificationsPanel() {
  const { state, actions } = useDashboard();
  return (
    <div className="px-3 lg:px-4">
      <NoticeList notices={state.notices} onPick={(n) => n.orderId && actions.open({ kind: "order", id: n.orderId })} />
      <div className="px-2 pt-3">
        <Button variant="secondary" className="w-full" onClick={() => actions.readNotices()}>
          <I.Check size={16} /> Mark all as read
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Toasts ─────────────────────────── */

export function Toasts() {
  const { state } = useDashboard();
  // Phones: new orders drop in from the top like a push notification; confirmations sit
  // above the tab bar so they never cover the controls you just tapped.
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-[max(10px,env(safe-area-inset-top))] lg:hidden"
        aria-live="polite"
      >
        {state.toasts
          .filter((t) => t.tone === "incoming")
          .map((t) => (
            <ToastItem key={t.id} toast={t} from="top" />
          ))}
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(max(14px,env(safe-area-inset-bottom))+72px)] z-[60] flex flex-col items-center gap-2 px-3 lg:hidden"
        aria-live="polite"
      >
        {state.toasts
          .filter((t) => t.tone !== "incoming")
          .map((t) => (
            <ToastItem key={t.id} toast={t} from="bottom" />
          ))}
      </div>
      <div
        className="pointer-events-none fixed right-5 bottom-5 z-[60] hidden flex-col items-end gap-2 lg:flex"
        aria-live="polite"
      >
        {state.toasts.map((t) => (
          <ToastItem key={t.id} toast={t} from="bottom" />
        ))}
      </div>
    </>
  );
}

function ToastItem({ toast, from }: { toast: Toast; from: "top" | "bottom" }) {
  const { state, actions } = useDashboard();
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const duration = toast.tone === "incoming" ? 9000 : 4800;

  const leave = () => {
    setLeaving(true);
    setTimeout(() => actions.dismiss(toast.id), 320);
  };

  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(leave, duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, duration]);

  const base = cx(
    "pointer-events-auto w-full max-w-[400px] transition-[transform,opacity] duration-500 ease-[var(--ease-spring)] lg:w-[380px]",
    shown && !leaving
      ? "translate-y-0 scale-100 opacity-100"
      : cx("scale-95 opacity-0", from === "top" ? "-translate-y-6" : "translate-y-6"),
  );

  if (toast.tone === "incoming" && toast.orderId) {
    const order = state.orders.find((o) => o.id === toast.orderId);
    if (!order) return null;
    const customer = state.customers.find((c) => c.id === order.customerId)!;
    const handled = order.status !== "pending";
    return (
      <div className={base} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="relative overflow-hidden rounded-[24px] bg-ink p-3.5 text-white shadow-float">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar name={customer.name} size={42} />
              <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-crust ring-2 ring-ink">
                <span className="size-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-butter uppercase">
                <span className="size-1.5 rounded-full bg-butter animate-pulse" /> New order
              </p>
              <p className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.015em]">{customer.name}</p>
              <p className="truncate text-[12.5px] text-white/60">
                {itemsSummary(order, state.menu)} · {dayLabel(state.today, order.day)} {clock(order.time)}
              </p>
            </div>
            <p className="tnum text-[16px] font-semibold">{money(order.total)}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                actions.open({ kind: "order", id: order.id });
                leave();
              }}
              className="h-9 rounded-full bg-white/10 text-[13px] font-medium transition hover:bg-white/15 active:scale-[0.97]"
            >
              View
            </button>
            <button
              disabled={handled}
              onClick={() => {
                actions.setStatus(order.id, "confirmed");
                leave();
              }}
              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#f6f1e4] text-[13px] font-semibold text-ink transition hover:bg-white active:scale-[0.97] disabled:opacity-50"
            >
              <I.Check size={15} /> {handled ? "Handled" : "Confirm"}
            </button>
          </div>
          {!paused && (
            <span
              className="absolute bottom-0 left-0 h-[2px] bg-crust"
              style={{ animation: `toastbar ${duration}ms linear forwards` }}
            />
          )}
        </div>
        <style>{`@keyframes toastbar{from{width:100%}to{width:0%}}`}</style>
      </div>
    );
  }

  const icon =
    toast.tone === "success" ? (
      <span className="grid size-7 place-items-center rounded-full bg-sage text-white">
        <I.Check size={15} />
      </span>
    ) : toast.tone === "danger" ? (
      <span className="grid size-7 place-items-center rounded-full bg-rose text-white">
        <I.X size={15} />
      </span>
    ) : (
      <span className="grid size-7 place-items-center rounded-full bg-white/15 text-white">
        <I.Spark size={15} />
      </span>
    );

  return (
    <div className={base} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center gap-3 rounded-[20px] bg-ink py-2.5 pr-2.5 pl-3 text-white shadow-float">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold tracking-[-0.01em]">{toast.title}</p>
          {toast.body && <p className="truncate text-[12px] text-white/55">{toast.body}</p>}
        </div>
        {toast.undo && (
          <button
            onClick={() => {
              toast.undo?.();
              leave();
            }}
            className="h-8 shrink-0 rounded-full bg-white/10 px-3 text-[12.5px] font-medium transition hover:bg-white/20"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
