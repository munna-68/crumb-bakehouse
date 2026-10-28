"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "../_lib/data";
import { clock, dateFor, dayLabel, dayLong, dayShort, money } from "../_lib/format";
import { isOpen, nextOpenDays, slotsFor, soldToday } from "../_lib/selectors";
import { useDashboard } from "../_lib/store";
import type { Category, Glyph, MenuItem } from "../_lib/types";
import { BrandMark, setAccepting } from "./shell";
import { FoodGlyph, I } from "./icons";
import { Button, Card, Eyebrow, Segmented, Stepper, Switch, cx } from "./ui";

const CATEGORIES: Category[] = ["Bread", "Pastry", "Seasonal", "Cakes"];

export function ShopView() {
  const [pane, setPane] = useState<"menu" | "hours" | "preview">("menu");
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0">
        <Segmented
          value={pane}
          onChange={setPane}
          options={[
            { value: "menu", label: "Menu" },
            { value: "hours", label: "Hours" },
            { value: "preview", label: "Live preview" },
          ]}
          className="mb-5 lg:hidden"
        />
        <Segmented
          value={pane === "preview" ? "menu" : pane}
          onChange={setPane}
          options={[
            { value: "menu", label: "Menu" },
            { value: "hours", label: "Hours & time off" },
          ]}
          className="mb-5 hidden max-w-[360px] lg:grid"
        />
        <div key={pane} className="animate-fade">
          {pane === "menu" && <MenuEditor />}
          {pane === "hours" && <HoursEditor />}
          {pane === "preview" && (
            <div className="lg:hidden">
              <Storefront />
            </div>
          )}
        </div>
        {pane === "preview" && (
          <div className="hidden lg:block">
            <MenuEditor />
          </div>
        )}
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em]">
              <span className="relative size-2 rounded-full bg-sage">
                <span className="absolute inset-0 animate-ping rounded-full bg-sage opacity-60" />
              </span>
              Live preview
            </p>
            <span className="text-[12px] text-ink-3">What customers see right now</span>
          </div>
          <Storefront />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Menu editor ─────────────────────────── */

function MenuEditor() {
  const { state, actions } = useDashboard();
  const live = state.menu.filter((m) => m.available).length;

  const toggle = (m: MenuItem, v: boolean) => {
    actions.saveItem({ ...m, available: v });
    actions.toast({
      id: `avail-${m.id}`,
      tone: v ? "success" : "neutral",
      title: v ? `${m.name} is back on` : `${m.name} marked sold out`,
      body: v ? "Customers can order it again." : "Hidden from checkout until you turn it back on.",
      undo: () => actions.saveItem({ ...m }),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[13px] text-ink-3">
          <span className="font-semibold text-ink">{live}</span> of {state.menu.length} items available today
        </p>
        <Button variant="primary" size="sm" onClick={() => actions.open({ kind: "item", id: null })}>
          <I.Plus size={15} /> Add item
        </Button>
      </div>
      {CATEGORIES.map((cat) => {
        const items = state.menu.filter((m) => m.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <Eyebrow className="mb-2 px-1">{cat}</Eyebrow>
            <Card className="divide-y divide-line/70 overflow-hidden">
              {items.map((m) => {
                const sold = soldToday(state, m.id);
                const pct = Math.min(1, sold / m.dailyLimit);
                return (
                  <div key={m.id} className="group relative flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
                    <button
                      onClick={() => actions.open({ kind: "item", id: m.id })}
                      className="absolute inset-0"
                      aria-label={`Edit ${m.name}`}
                    />
                    <span
                      className={cx(
                        "pointer-events-none grid size-12 shrink-0 place-items-center rounded-[14px] transition-colors duration-300",
                        m.available ? "bg-paper text-ink-2" : "bg-paper-2/60 text-ink-4",
                      )}
                    >
                      <FoodGlyph glyph={m.glyph} size={30} />
                    </span>
                    <div className="pointer-events-none min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cx("truncate text-[14.5px] font-semibold tracking-[-0.015em]", !m.available && "text-ink-3")}>
                          {m.name}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="tnum text-[13px] font-medium text-ink-2">{money(m.price)}</span>
                        <span className="text-ink-4">·</span>
                        {m.available ? (
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1 w-12 overflow-hidden rounded-full bg-paper-2">
                              <span
                                className={cx("block h-full rounded-full transition-[width] duration-500", pct >= 0.8 ? "bg-crust" : "bg-ink/70")}
                                style={{ width: `${pct * 100}%` }}
                              />
                            </span>
                            <span className="tnum truncate text-[12px] text-ink-3">
                              {sold}/{m.dailyLimit} today
                            </span>
                          </span>
                        ) : (
                          <span className="text-[12px] font-medium text-crust">Sold out</span>
                        )}
                      </div>
                    </div>
                    <span className="relative">
                      <Switch checked={m.available} onChange={(v) => toggle(m, v)} label={`${m.name} available`} tone="sage" />
                    </span>
                  </div>
                );
              })}
            </Card>
          </section>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Item sheet ─────────────────────────── */

const GLYPH_FOR: Record<Category, Glyph> = { Bread: "loaf", Pastry: "croissant", Seasonal: "pumpkin", Cakes: "cake" };

export function ItemEditor({ id }: { id: string | null }) {
  const { state, actions } = useDashboard();
  const existing = id ? state.menu.find((m) => m.id === id) : undefined;
  const [draft, setDraft] = useState<MenuItem>(
    () =>
      existing ?? {
        id: `item-${state.menu.length + 1}-${Math.round(performance.now())}`,
        name: "",
        description: "",
        category: "Pastry",
        price: 6,
        dailyLimit: 12,
        available: true,
        glyph: "croissant",
      },
  );
  const set = <K extends keyof MenuItem>(k: K, v: MenuItem[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const valid = draft.name.trim().length > 1 && draft.price > 0;

  const save = () => {
    if (!valid) return;
    actions.saveItem({ ...draft, name: draft.name.trim(), description: draft.description.trim() });
    actions.close();
    actions.toast({
      id: `item-${draft.id}`,
      tone: "success",
      title: existing ? "Menu updated" : `${draft.name.trim()} added`,
      body: "Live on your order page now.",
      undo: existing ? () => actions.saveItem(existing) : () => actions.removeItem(draft.id),
    });
  };

  return (
    <div className="px-5 lg:px-6">
      <div className="flex items-center gap-4 rounded-[22px] bg-surface p-4 ring-1 ring-line/70">
        <span className="grid size-16 shrink-0 place-items-center rounded-[18px] bg-paper text-ink-2">
          <FoodGlyph glyph={draft.glyph} size={40} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold tracking-[-0.02em]">{draft.name || "New item"}</p>
          <p className="tnum text-[14px] text-ink-2">
            {money(draft.price)} · up to {draft.dailyLimit} a day
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Field label="Name">
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Maple Pecan Scones"
            className="h-12 w-full rounded-[14px] bg-surface px-4 text-[15px] ring-1 ring-line outline-none transition placeholder:text-ink-4 focus:ring-2 focus:ring-ink"
            autoFocus={!existing}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="What makes it special, in one line"
            className="w-full resize-none rounded-[14px] bg-surface px-4 py-3 text-[14px] leading-snug ring-1 ring-line outline-none transition placeholder:text-ink-4 focus:ring-2 focus:ring-ink"
          />
        </Field>
        <Field label="Category">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setDraft((d) => ({ ...d, category: c, glyph: existing ? d.glyph : GLYPH_FOR[c] }))}
                className={cx(
                  "h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                  draft.category === c ? "bg-ink text-white" : "bg-surface text-ink-2 ring-1 ring-line hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <div className="divide-y divide-line/70 rounded-[18px] bg-surface ring-1 ring-line/70">
          <Row label="Price" hint="What customers pay">
            <Stepper value={draft.price} onChange={(v) => set("price", v)} min={1} max={250} format={(v) => money(v)} label="price" />
          </Row>
          <Row label="Daily limit" hint="Stops orders when you hit it">
            <Stepper value={draft.dailyLimit} onChange={(v) => set("dailyLimit", v)} min={1} max={60} label="daily limit" />
          </Row>
          <Row label="Available today" hint={draft.available ? "Showing on your order page" : "Hidden as sold out"}>
            <Switch checked={draft.available} onChange={(v) => set("available", v)} label="Available today" tone="sage" />
          </Row>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-5 flex gap-2 bg-gradient-to-t from-paper via-paper to-paper/0 px-5 pt-4 lg:-mx-6 lg:px-6">
        {existing && (
          <Button
            variant="danger"
            size="lg"
            aria-label="Remove item"
            className="px-4"
            onClick={() => {
              actions.removeItem(existing.id);
              actions.close();
              actions.toast({
                tone: "danger",
                title: `${existing.name} removed`,
                body: "Taken off your order page.",
                undo: () => actions.saveItem(existing),
              });
            }}
          >
            <I.Trash size={17} />
          </Button>
        )}
        <Button variant="primary" size="lg" className="flex-1" disabled={!valid} onClick={save}>
          {existing ? "Save changes" : "Add to menu"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[12px] font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-medium">{label}</p>
        {hint && <p className="truncate text-[12px] text-ink-3">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────── Hours editor ─────────────────────────── */

const WEEK = [1, 2, 3, 4, 5, 6, 0];

function HoursEditor() {
  const { state, actions } = useDashboard();
  const [expanded, setExpanded] = useState<number | null>(null);
  const todayDow = state.today.getDay();

  const toggleDay = (dow: number, open: boolean) => {
    actions.setHours(dow, { open });
    actions.toast({
      id: `hours-${dow}`,
      tone: open ? "success" : "neutral",
      title: open ? `Open on ${dayLong(dow)}s` : `Closed on ${dayLong(dow)}s`,
      body: open ? "Customers can book pickups that day." : "Removed from checkout. Existing orders stay.",
      undo: () => actions.setHours(dow, { open: !open }),
    });
  };

  const quickOff = [
    { label: "Tomorrow", from: 1, to: 1 },
    { label: "This weekend", ...weekendRange(todayDow) },
    { label: "Next week", from: 7 - ((todayDow + 6) % 7), to: 13 - ((todayDow + 6) % 7) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section>
        <div className="mb-2 flex items-end justify-between px-1">
          <Eyebrow>Weekly pickup hours</Eyebrow>
          <span className="text-[11.5px] text-ink-3">Tap a day to adjust</span>
        </div>
        <Card className="divide-y divide-line/70 overflow-hidden">
          {WEEK.map((dow) => {
            const h = state.hours[dow];
            const open = expanded === dow && h.open;
            return (
              <div key={dow}>
                <div className="relative flex items-center gap-3 px-4 py-3.5">
                  <button
                    className="absolute inset-0"
                    aria-label={`Edit ${dayLong(dow)}`}
                    aria-expanded={open}
                    onClick={() => setExpanded(open ? null : dow)}
                    disabled={!h.open}
                  />
                  <span
                    className={cx(
                      "pointer-events-none grid size-10 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors",
                      h.open ? (dow === todayDow ? "bg-crust text-white" : "bg-ink text-white") : "bg-paper-2 text-ink-4",
                    )}
                  >
                    {dayShort(dow)}
                  </span>
                  <div className="pointer-events-none min-w-0 flex-1">
                    <p className={cx("text-[14.5px] font-semibold tracking-[-0.015em]", !h.open && "text-ink-3")}>
                      {dayLong(dow)}
                      {dow === todayDow && <span className="ml-1.5 text-[11.5px] font-medium text-crust">Today</span>}
                    </p>
                    <p className="tnum truncate text-[12.5px] text-ink-3">
                      {h.open ? `${clock(h.start)} – ${clock(h.end)} · ${h.capacity} per half hour` : "Closed"}
                    </p>
                  </div>
                  {h.open && (
                    <I.ChevronDown
                      size={16}
                      className={cx("pointer-events-none text-ink-4 transition-transform duration-300", open && "rotate-180")}
                    />
                  )}
                  <span className="relative">
                    <Switch checked={h.open} onChange={(v) => toggleDay(dow, v)} label={`Open ${dayLong(dow)}`} />
                  </span>
                </div>
                <div className="collapse-row" data-collapsed={open ? "false" : "true"}>
                  <div>
                    <div className="grid gap-2 bg-surface-2 px-4 py-3 sm:grid-cols-3">
                      <HourControl label="Opens">
                        <Stepper
                          value={h.start}
                          step={30}
                          min={6 * 60}
                          max={h.end - 60}
                          onChange={(v) => actions.setHours(dow, { start: v })}
                          format={(v) => clock(v)}
                          label="opening time"
                        />
                      </HourControl>
                      <HourControl label="Last pickup">
                        <Stepper
                          value={h.end}
                          step={30}
                          min={h.start + 60}
                          max={19 * 60}
                          onChange={(v) => actions.setHours(dow, { end: v })}
                          format={(v) => clock(v)}
                          label="closing time"
                        />
                      </HourControl>
                      <HourControl label="Orders / 30 min">
                        <Stepper
                          value={h.capacity}
                          min={1}
                          max={10}
                          onChange={(v) => actions.setHours(dow, { capacity: v })}
                          label="orders per slot"
                        />
                      </HourControl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <section>
        <Eyebrow className="mb-2 px-1">Time off</Eyebrow>
        <Card className="p-4">
          {state.timeOff.length === 0 ? (
            <p className="text-[13px] text-ink-3">No time off planned. Block days and checkout skips them.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {state.timeOff.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-[16px] bg-paper/80 py-2.5 pr-2 pl-3.5 animate-rise">
                  <I.Calendar size={18} className="shrink-0 text-ink-3" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">{t.label}</p>
                    <p className="tnum text-[12px] text-ink-3">
                      {dayLabel(state.today, t.from)}
                      {t.to !== t.from && ` → ${dayLabel(state.today, t.to)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const prev = state.timeOff;
                      actions.setTimeOff(prev.filter((x) => x.id !== t.id));
                      actions.toast({
                        tone: "neutral",
                        title: "Time off removed",
                        body: "Those days are bookable again.",
                        undo: () => actions.setTimeOff(prev),
                      });
                    }}
                    aria-label={`Remove ${t.label}`}
                    className="grid size-8 place-items-center rounded-full text-ink-3 transition hover:bg-surface hover:text-ink"
                  >
                    <I.X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 mb-2 text-[12px] font-medium text-ink-2">Quick block</p>
          <div className="flex flex-wrap gap-1.5">
            {quickOff.map((q) => {
              const exists = state.timeOff.some((t) => t.from === q.from && t.to === q.to);
              return (
                <button
                  key={q.label}
                  disabled={exists}
                  onClick={() => {
                    const prev = state.timeOff;
                    actions.setTimeOff([...prev, { id: `to-${Date.now()}`, label: `Off · ${q.label.toLowerCase()}`, from: q.from, to: q.to }]);
                    actions.toast({
                      tone: "neutral",
                      title: `Blocked ${q.label.toLowerCase()}`,
                      body: "Checkout won’t offer those days.",
                      undo: () => actions.setTimeOff(prev),
                    });
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-[13px] font-medium text-ink-2 ring-1 ring-line transition hover:text-ink disabled:opacity-40"
                >
                  <I.Plus size={14} /> {q.label}
                </button>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}

function weekendRange(todayDow: number) {
  const toSat = (6 - todayDow + 7) % 7;
  return todayDow === 0 ? { from: 0, to: 0 } : { from: toSat, to: toSat + 1 };
}

function HourControl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
      {children}
    </div>
  );
}

/* ─────────────────────────── Storefront preview ─────────────────────────── */

export function Storefront() {
  const { state, actions } = useDashboard();
  const flash = useFlash(state.menu);
  const days = nextOpenDays(state, 4);
  const [picked, setPicked] = useState<number | null>(null);
  const pickDay = picked !== null && days.includes(picked) ? picked : days[0];
  const slots = pickDay !== undefined ? slotsFor(state, pickDay).filter((s) => s.left > 0).slice(0, 6) : [];

  return (
    <div className="overflow-hidden rounded-[30px] bg-surface shadow-float ring-1 ring-line">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-line-2" />
          <span className="size-2 rounded-full bg-line-2" />
          <span className="size-2 rounded-full bg-line-2" />
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-paper-2/70 py-1 text-[11px] text-ink-3">
          <I.Lock size={11} /> {BUSINESS.site}/order
        </span>
      </div>

      <div className="relative">
        <div className={cx("transition-[filter,opacity] duration-500", !state.accepting && "opacity-40 blur-[2px]")}>
          <div className="px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <BrandMark size={30} />
              <div>
                <p className="text-[14px] font-semibold tracking-[-0.02em]">{BUSINESS.name}</p>
                <p className="text-[11px] text-ink-3">Pickup · {BUSINESS.city}</p>
              </div>
            </div>
            <h3 className="mt-4 font-serif text-[30px] leading-[1.05]">
              Fresh from the oven, <span className="italic">ready when you are.</span>
            </h3>
          </div>

          <div className="mt-4 px-5">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-3 uppercase">Choose pickup</p>
            {days.length === 0 ? (
              <p className="rounded-[14px] bg-paper px-3 py-2.5 text-[12.5px] text-ink-3">No pickup days open right now.</p>
            ) : (
              <>
                <div className="flex gap-1.5">
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => setPicked(d)}
                      className={cx(
                        "flex-1 rounded-[14px] py-2 text-center transition-colors duration-300",
                        d === pickDay ? "bg-ink text-white" : "bg-paper text-ink hover:bg-paper-2",
                      )}
                    >
                      <span className={cx("block text-[10px]", d === pickDay ? "text-white/55" : "text-ink-3")}>
                        {d === 0 ? "Today" : dayShort(dateFor(state.today, d).getDay())}
                      </span>
                      <span className="tnum block text-[15px] font-semibold">{dateFor(state.today, d).getDate()}</span>
                    </button>
                  ))}
                </div>
                <div key={pickDay} className="mt-2 flex flex-wrap gap-1.5 animate-fade">
                  {slots.map((s) => (
                    <span key={s.time} className="tnum rounded-full bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
                      {clock(s.time)}
                    </span>
                  ))}
                </div>
              </>
            )}
            {!isOpen(state, 0) && <p className="mt-2 text-[11.5px] text-crust">Closed today, back tomorrow.</p>}
          </div>

          <div className="mt-5 max-h-[460px] overflow-y-auto px-3 pb-4">
            {CATEGORIES.map((cat) => {
              const items = state.menu.filter((m) => m.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="mb-2">
                  <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wide text-ink-3 uppercase">{cat}</p>
                  {items.map((m) => {
                    const left = m.dailyLimit - soldToday(state, m.id);
                    return (
                      <div
                        key={m.id}
                        className={cx(
                          "flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition-[background-color,opacity] duration-500",
                          flash.has(m.id) && "animate-flash",
                          !m.available && "opacity-55",
                        )}
                      >
                        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-paper text-ink-2">
                          <FoodGlyph glyph={m.glyph} size={30} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-semibold tracking-[-0.01em]">{m.name}</p>
                          <p className="line-clamp-1 text-[11.5px] text-ink-3">{m.description}</p>
                          <p className="tnum mt-0.5 text-[12.5px] font-medium">
                            {money(m.price)}
                            {m.available && left > 0 && left <= 3 && (
                              <span className="ml-1.5 text-[11px] font-medium text-crust">Only {left} left</span>
                            )}
                          </p>
                        </div>
                        {m.available ? (
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                            <I.Plus size={15} />
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-paper-2 px-2 py-1 text-[10.5px] font-semibold text-ink-3">
                            Sold out
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {!state.accepting && (
          <div className="absolute inset-0 grid place-items-center p-6 animate-fade">
            <div className="rounded-[22px] bg-surface p-5 text-center shadow-float ring-1 ring-line">
              <p className="font-serif text-[26px] italic">Back soon</p>
              <p className="mt-1 text-[12.5px] text-ink-3">We’re not taking orders at the moment.</p>
              <Button variant="primary" size="sm" className="mt-3" onClick={() => setAccepting(actions, true)}>
                Resume orders
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Returns ids of menu items whose object identity changed since the last render. */
function useFlash(menu: MenuItem[]) {
  const prev = useRef(menu);
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const changed = menu.filter((m) => !prev.current.includes(m)).map((m) => m.id);
    prev.current = menu;
    if (!changed.length) return;
    setIds(new Set(changed));
    const t = setTimeout(() => setIds(new Set()), 1600);
    return () => clearTimeout(t);
  }, [menu]);
  return ids;
}
