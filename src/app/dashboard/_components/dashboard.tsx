"use client";

import { useDashboard, DashboardProvider } from "../_lib/store";
import { InsightsView } from "./insights";
import { OrderDetail, Reschedule } from "./orders";
import { OrdersView } from "./orders-view";
import { NotificationsPanel, Sidebar, TabBar, Toasts, TopBar } from "./shell";
import { ItemEditor, ShopView } from "./shop";
import { TodayView } from "./today";
import { STATUS_META } from "../_lib/format";
import { Chip, Eyebrow, Sheet } from "./ui";

export function Dashboard() {
  return (
    <DashboardProvider>
      <Frame />
    </DashboardProvider>
  );
}

function Frame() {
  const { state } = useDashboard();
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-32 sm:px-6 lg:pb-12 lg:pl-[calc(256px+40px)] lg:pr-10">
        {state.ready ? (
          <>
            <TopBar />
            <div key={state.tab} className="animate-rise">
              {state.tab === "today" && <TodayView />}
              {state.tab === "orders" && <OrdersView />}
              {state.tab === "insights" && <InsightsView />}
              {state.tab === "shop" && <ShopView />}
            </div>
          </>
        ) : (
          <Loading />
        )}
      </main>
      {state.ready && <TabBar />}
      <Sheets />
      <Toasts />
    </div>
  );
}

function Sheets() {
  const { state, actions } = useDashboard();
  const s = state.sheet;
  const order = s && (s.kind === "order" || s.kind === "reschedule") ? state.orders.find((o) => o.id === s.id) : undefined;
  const item = s?.kind === "item" && s.id ? state.menu.find((m) => m.id === s.id) : undefined;

  return (
    <>
      <Sheet
        open={s?.kind === "order"}
        onClose={actions.close}
        label="Order details"
        title={
          order && (
            <div className="flex items-center gap-2">
              <Eyebrow>Order {order.id}</Eyebrow>
              <Chip tone={STATUS_META[order.status].tone} className="!h-5 !px-2 !text-[10.5px]">
                {STATUS_META[order.status].label}
              </Chip>
            </div>
          )
        }
      >
        {s?.kind === "order" && <OrderDetail id={s.id} />}
      </Sheet>
      <Sheet
        open={s?.kind === "reschedule"}
        onClose={actions.close}
        label="Reschedule pickup"
        title={<h3 className="text-[20px] font-semibold tracking-[-0.025em]">Reschedule pickup</h3>}
      >
        {s?.kind === "reschedule" && <Reschedule key={s.id} id={s.id} />}
      </Sheet>
      <Sheet
        open={s?.kind === "item"}
        onClose={actions.close}
        label="Edit menu item"
        title={<h3 className="text-[20px] font-semibold tracking-[-0.025em]">{item ? "Edit item" : "New menu item"}</h3>}
      >
        {s?.kind === "item" && <ItemEditor key={s.id ?? "new"} id={s.id} />}
      </Sheet>
      <Sheet
        open={s?.kind === "notifications"}
        onClose={actions.close}
        label="Notifications"
        title={<h3 className="text-[20px] font-semibold tracking-[-0.025em]">Notifications</h3>}
      >
        <NotificationsPanel />
      </Sheet>
    </>
  );
}

/* ─────────────────────────── Loading state ─────────────────────────── */

function Bone({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="animate-fade">
      <div className="flex items-center gap-3 pt-[max(12px,env(safe-area-inset-top))] pb-4 lg:pt-7 lg:pb-5">
        <Bone className="size-9 rounded-[11px] lg:hidden" />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="h-4 w-40 rounded-full lg:h-7 lg:w-32" />
        </div>
        <Bone className="size-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="space-y-2 pt-1 lg:hidden">
          <Bone className="h-10 w-64 rounded-[12px]" />
          <Bone className="h-4 w-48 rounded-full" />
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-[28px] bg-ink lg:col-span-5 lg:h-[330px]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] bg-[length:200%_100%] animate-shimmer" />
          <div className="space-y-4 p-6">
            <div className="h-2.5 w-24 rounded-full bg-white/10" />
            <div className="h-16 w-52 rounded-[14px] bg-white/[0.07]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-7 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
          <Bone className="h-[172px] rounded-[22px] lg:h-full" />
          <Bone className="h-[172px] rounded-[22px] lg:h-full" />
        </div>
        <div className="space-y-3 lg:col-span-7">
          <Bone className="h-5 w-40 rounded-full" />
          <Bone className="h-[150px] rounded-[22px]" />
          <Bone className="h-[150px] rounded-[22px]" />
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <Bone className="h-[420px] rounded-[22px]" />
        </div>
      </div>
    </div>
  );
}
