"use client";

import { useState } from "react";
import { clock, dayShort, money } from "../_lib/format";
import type { Bar } from "../_lib/selectors";
import type { Order } from "../_lib/types";
import { cx } from "./ui";

/* ─────────────────────────── Dot-matrix numerals ─────────────────────────── */

const GLYPHS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  ",": ["..", "..", "..", "..", "..", ".#", "#."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
  "%": ["##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##"],
};

/**
 * Renders a string as a 5×7 dot matrix. Unlit dots stay faintly visible, like an LED sign,
 * which is what gives the hero number its texture.
 */
export function DotDigits({
  text,
  dot = 7,
  gap = 2.6,
  on = "currentColor",
  off = "currentColor",
  offOpacity = 0.1,
  className,
  label,
}: {
  text: string;
  dot?: number;
  gap?: number;
  on?: string;
  off?: string;
  offOpacity?: number;
  className?: string;
  label: string;
}) {
  const pitch = dot + gap;
  const chars = [...text].map((c) => GLYPHS[c] ?? GLYPHS["0"]);
  let x = 0;
  const cells: { x: number; y: number; lit: boolean; key: string }[] = [];
  chars.forEach((g, ci) => {
    const w = g[0].length;
    g.forEach((row, ry) =>
      [...row].forEach((ch, rx) => cells.push({ x: x + rx * pitch, y: ry * pitch, lit: ch === "#", key: `${ci}-${rx}-${ry}` })),
    );
    x += w * pitch + pitch * 0.9;
  });
  const width = x - pitch * 0.9 - gap;
  const height = 7 * pitch - gap;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={label}
    >
      {cells.map((c) => (
        <circle
          key={c.key}
          cx={c.x + dot / 2}
          cy={c.y + dot / 2}
          r={dot / 2}
          fill={c.lit ? on : off}
          opacity={c.lit ? 1 : offOpacity}
          style={{ transition: "opacity 420ms ease, fill 420ms ease" }}
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────── Day timeline (hero) ─────────────────────────── */

export function DayTimeline({
  orders,
  start,
  end,
  now,
}: {
  orders: Order[];
  start: number;
  end: number;
  now: number;
}) {
  const span = end - start;
  const pct = (m: number) => `${Math.min(100, Math.max(0, ((m - start) / span) * 100))}%`;
  const hours: number[] = [];
  for (let h = Math.ceil(start / 60); h * 60 <= end; h++) hours.push(h * 60);
  return (
    <div className="relative select-none">
      <div className="relative h-9">
        {/* Elapsed part of the day, hatched */}
        <div className="absolute inset-y-2 left-0 overflow-hidden rounded-l-full" style={{ width: pct(now) }}>
          <div className="hatch h-full w-full text-white/25" />
        </div>
        <div className="absolute inset-y-2 right-0 rounded-r-full bg-white/[0.06]" style={{ left: pct(now) }} />
        {orders.map((o) => {
          const missed = o.status === "no_show" || o.status === "cancelled" || o.status === "declined";
          const done = o.status === "picked_up";
          return (
            <span
              key={o.id}
              title={`${clock(o.time)}`}
              className={cx(
                "absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500",
                missed ? "bg-crust" : done ? "bg-white/45" : o.status === "pending" ? "bg-butter" : "bg-white",
                o.fresh && "animate-[fade_0.6s_ease-out_both]",
              )}
              style={{ left: pct(o.time) }}
            />
          );
        })}
        <div className="absolute inset-y-0 w-px bg-crust" style={{ left: pct(now) }}>
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-crust" />
        </div>
      </div>
      <div className="relative mt-1 h-4 font-mono text-[9.5px] tracking-wider text-white/40">
        {hours.map((h) => (
          <span key={h} className="absolute -translate-x-1/2" style={{ left: pct(h) }}>
            {clock(h, false).replace(":00", "")}
          </span>
        ))}
        <span
          className="absolute -top-0.5 -translate-x-1/2 rounded-full bg-crust px-1.5 py-px text-[9px] font-semibold text-white"
          style={{ left: pct(now) }}
        >
          NOW
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Weekly bars ─────────────────────────── */

export function WeekBars({ bars, height = 148, compact }: { bars: Bar[]; height?: number; compact?: boolean }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const scaleMax = Math.ceil(max / 200) * 200;
  const [active, setActive] = useState<number | null>(null);
  const todayIdx = bars.findIndex((b) => b.kind === "today");
  const focus = active ?? (todayIdx >= 0 ? todayIdx : null);
  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      {!compact && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height }}>
          {[scaleMax, scaleMax / 2, 0].map((v) => (
            <div key={v} className="flex items-center gap-2">
              <span className="tnum w-9 shrink-0 text-right font-mono text-[9.5px] text-ink-4">
                {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              </span>
              <span className="h-px flex-1 border-t border-dashed border-line" />
            </div>
          ))}
        </div>
      )}
      <div className={cx("relative flex items-end", compact ? "gap-1.5" : "gap-2 pl-11 sm:gap-3")} style={{ height }}>
        {bars.map((b, i) => {
          const h = b.kind === "closed" ? 6 : Math.max(8, (b.value / scaleMax) * height);
          const isFocus = focus === i;
          return (
            <button
              key={b.offset}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${dayShort(b.dow)}: ${b.kind === "closed" ? "closed" : money(b.value)}`}
              className="group relative flex h-full flex-1 items-end justify-center outline-none"
            >
              {!compact && isFocus && b.kind !== "closed" && (
                <span
                  className="tnum absolute z-10 -translate-y-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow-float animate-fade"
                  style={{ bottom: h }}
                >
                  {money(b.value)}
                  {b.kind === "future" && <span className="text-white/50"> booked</span>}
                </span>
              )}
              <span
                className={cx(
                  "relative w-full overflow-hidden transition-[height,background-color,opacity] duration-700 ease-[var(--ease-out-quint)]",
                  compact ? "max-w-[18px] rounded-[5px]" : "max-w-[34px] rounded-[9px]",
                  b.kind === "closed" && "bg-line",
                  b.kind === "past" && (isFocus ? "bg-ink" : "bg-ink/85"),
                  b.kind === "today" && "bg-crust",
                  b.kind === "future" && "bg-paper-2 text-ink/30 ring-1 ring-inset ring-line-2",
                  active !== null && !isFocus && "opacity-60",
                )}
                style={{ height: h }}
              >
                {b.kind === "future" && <span className="hatch absolute inset-0" />}
              </span>
            </button>
          );
        })}
      </div>
      <div className={cx("mt-2 flex", compact ? "gap-1.5" : "gap-2 pl-11 sm:gap-3")}>
        {bars.map((b, i) => (
          <span
            key={b.offset}
            className={cx(
              "flex-1 text-center font-mono text-[10px] tracking-wide uppercase transition-colors",
              focus === i ? "text-ink" : "text-ink-4",
              compact && "text-[9px]",
            )}
          >
            {compact ? dayShort(b.dow)[0] : dayShort(b.dow)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Month dot columns ─────────────────────────── */

export function MonthDots({ days, height = 148 }: { days: { offset: number; value: number }[]; height?: number }) {
  const rows = 14;
  const unit = Math.max(...days.map((d) => d.value), 1) / rows;
  const [active, setActive] = useState<number | null>(null);
  const focus = active ?? days.length - 1;
  return (
    <div onMouseLeave={() => setActive(null)}>
      <div className="flex items-end justify-between gap-[3px]" style={{ height }}>
        {days.map((d, i) => {
          const lit = Math.round(d.value / unit);
          const recent = i >= days.length - 7;
          return (
            <button
              key={d.offset}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${money(d.value)}`}
              className="flex h-full flex-1 flex-col-reverse items-center gap-[3px] outline-none"
            >
              {Array.from({ length: rows }, (_, r) => (
                <span
                  key={r}
                  className={cx(
                    "aspect-square w-full max-w-[7px] rounded-full transition-colors duration-500",
                    r < lit
                      ? i === focus
                        ? "bg-crust"
                        : recent
                          ? "bg-ink"
                          : "bg-ink/35"
                      : r === 0
                        ? "bg-ink/10"
                        : "bg-transparent",
                  )}
                  style={{ transitionDelay: `${r * 18}ms` }}
                />
              ))}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-wide text-ink-3 uppercase">
        <span>30 days ago</span>
        <span className="tnum text-ink">
          {focus === days.length - 1 ? "Today" : `${days.length - 1 - focus}d ago`} · {money(days[focus].value)}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Tick gauge ─────────────────────────── */

export function TickGauge({ value, size = 168, ticks = 44 }: { value: number; size?: number; ticks?: number }) {
  const r = size / 2 - 4;
  const inner = r - 18;
  const lit = Math.round(value * ticks);
  return (
    <svg width={size} height={size / 2 + 6} viewBox={`0 0 ${size} ${size / 2 + 6}`} aria-hidden>
      {Array.from({ length: ticks }, (_, i) => {
        const a = Math.PI - (i / (ticks - 1)) * Math.PI;
        const cx0 = size / 2;
        const cy0 = size / 2 + 2;
        const long = i % 11 === 0;
        const ri = long ? inner - 4 : inner;
        return (
          <line
            key={i}
            x1={cx0 + Math.cos(a) * ri}
            y1={cy0 - Math.sin(a) * ri}
            x2={cx0 + Math.cos(a) * r}
            y2={cy0 - Math.sin(a) * r}
            strokeWidth={long ? 2 : 1.6}
            strokeLinecap="round"
            className={cx("transition-[stroke] duration-500", i < lit ? "stroke-ink" : "stroke-line-2")}
            style={{ transitionDelay: `${i * 12}ms` }}
          />
        );
      })}
    </svg>
  );
}

/* ─────────────────────────── Busy times grid ─────────────────────────── */

export function BusyGrid({ grid }: { grid: { dow: number; counts: number[] }[] }) {
  const max = Math.max(...grid.flatMap((g) => g.counts), 1);
  const hours = [8, 9, 10, 11, 12, 13];
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="grid gap-y-2" style={{ gridTemplateColumns: `36px repeat(${hours.length}, minmax(0,1fr))` }}>
        <span />
        {hours.map((h) => (
          <span key={h} className="text-center font-mono text-[9.5px] tracking-wide text-ink-4">
            {h > 12 ? h - 12 : h}
            {h >= 12 ? "p" : "a"}
          </span>
        ))}
        {grid.map((row) => (
          <Row key={row.dow} row={row} max={max} hover={hover} setHover={setHover} />
        ))}
      </div>
      <div className="mt-4 flex h-5 items-center justify-between text-[11.5px] text-ink-3">
        {hover ? (
          <span className="animate-fade">
            <span className="font-medium text-ink">
              {dayShort(hover.d)} {hours[hover.h] > 12 ? hours[hover.h] - 12 : hours[hover.h]}
              {hours[hover.h] >= 12 ? " PM" : " AM"}
            </span>{" "}
            · avg {grid.find((g) => g.dow === hover.d)?.counts[hover.h]} pickups
          </span>
        ) : (
          <span>Avg pickups per hour, last 8 weeks</span>
        )}
        <span className="flex items-center gap-1">
          {[0.15, 0.4, 0.7, 1].map((o) => (
            <span key={o} className="size-2 rounded-full bg-ink" style={{ opacity: o }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function Row({
  row,
  max,
  hover,
  setHover,
}: {
  row: { dow: number; counts: number[] };
  max: number;
  hover: { d: number; h: number } | null;
  setHover: (v: { d: number; h: number }) => void;
}) {
  return (
    <>
      <span className="self-center font-mono text-[10px] tracking-wide text-ink-3 uppercase">{dayShort(row.dow)}</span>
      {row.counts.map((c, h) => {
        const v = c / max;
        const isHover = hover?.d === row.dow && hover.h === h;
        const size = 8 + v * 18;
        return (
          <button
            key={h}
            onMouseEnter={() => setHover({ d: row.dow, h })}
            onClick={() => setHover({ d: row.dow, h })}
            aria-label={`${dayShort(row.dow)} ${h + 8}:00, ${c} pickups`}
            className="grid h-7 place-items-center outline-none"
          >
            <span
              className={cx("rounded-full transition-all duration-300", v >= 0.85 ? "bg-crust" : "bg-ink")}
              style={{
                width: size,
                height: size,
                opacity: v >= 0.85 ? 1 : 0.12 + v * 0.8,
                transform: isHover ? "scale(1.18)" : undefined,
              }}
            />
          </button>
        );
      })}
    </>
  );
}
