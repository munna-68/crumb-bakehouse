"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initials } from "../_lib/format";
import { I } from "./icons";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ─────────────────────────── Chips ─────────────────────────── */

type Tone = "ink" | "sage" | "crust" | "rose" | "muted" | "butter" | "outline";

const TONES: Record<Tone, string> = {
  ink: "bg-ink text-white",
  sage: "bg-sage-soft text-[#3f6a3b]",
  crust: "bg-crust text-white",
  rose: "bg-rose-soft text-rose",
  muted: "bg-paper-2 text-ink-2",
  butter: "bg-butter-soft text-[#8a6a0c]",
  outline: "border border-line-2 text-ink-2",
};

export function Chip({
  tone = "muted",
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors duration-300",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/* ─────────────────────────── Buttons ─────────────────────────── */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

const BTN: Record<BtnVariant, string> = {
  primary: "bg-ink text-white hover:bg-[#2c2a27] active:bg-black",
  secondary: "bg-surface text-ink border border-line hover:border-line-2 hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "bg-surface text-rose border border-line hover:border-rose/30 hover:bg-rose-soft/50",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={cx(
        "inline-flex select-none items-center justify-center gap-1.5 rounded-full font-medium tracking-[-0.01em] whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "h-8 px-3 text-[12.5px]",
        size === "md" && "h-10 px-4 text-[13.5px]",
        size === "lg" && "h-12 px-5 text-[15px]",
        BTN[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        "relative grid size-10 place-items-center rounded-full bg-surface text-ink shadow-card ring-1 ring-line transition-[transform,background-color] duration-200 hover:bg-surface-2 active:scale-95",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Avatar ─────────────────────────── */

const AVATAR_TINTS = ["#efe4d6", "#e3e9de", "#e8e2ef", "#f3e3dc", "#e0e7ea", "#f1ead0"];

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const tint = AVATAR_TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded-full font-medium text-ink-2", className)}
      style={{ width: size, height: size, background: tint, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ─────────────────────────── Switch ─────────────────────────── */

export function Switch({
  checked,
  onChange,
  label,
  tone = "ink",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  tone?: "ink" | "sage";
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300",
        checked ? (tone === "sage" ? "bg-sage" : "bg-ink") : "bg-line-2",
      )}
    >
      <span
        className={cx(
          "absolute top-[3px] left-[3px] size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.2)] transition-transform duration-300 ease-[var(--ease-spring)]",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}

/* ─────────────────────────── Stepper ─────────────────────────── */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  format = (v: number) => String(v),
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  label: string;
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-full bg-paper-2/70 p-0.5" role="group" aria-label={label}>
      <button
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
        className="grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-30"
      >
        <I.Minus size={15} />
      </button>
      <span className="tnum min-w-[4.5ch] text-center text-[13px] font-medium">{format(value)}</span>
      <button
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
        className="grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-30"
      >
        <I.Plus size={15} />
      </button>
    </div>
  );
}

/* ─────────────────────────── Segmented ─────────────────────────── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
  size?: "sm" | "md";
}) {
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div
      className={cx("relative grid rounded-full bg-paper-2/80 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      <span
        className="absolute top-1 bottom-1 left-1 rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform duration-400 ease-[var(--ease-out-quint)]"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            "relative z-10 rounded-full font-medium tracking-[-0.01em] transition-colors duration-300",
            size === "md" ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-[12px]",
            o.value === value ? "text-ink" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Card ─────────────────────────── */

export function Card({
  className,
  children,
  as: As = "section",
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: "section" | "div" | "article" }) {
  return (
    <As className={cx("rounded-[22px] bg-surface shadow-card ring-1 ring-line/70", className)} {...rest}>
      {children}
    </As>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cx("font-mono text-[10.5px] font-medium tracking-[0.08em] text-ink-3 uppercase", className)}>{children}</p>
  );
}

export function SectionTitle({
  title,
  count,
  action,
  className,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-end justify-between gap-3", className)}>
      <h2 className="flex items-baseline gap-2 text-[17px] font-semibold tracking-[-0.02em]">
        {title}
        {count !== undefined && <span className="tnum text-[13px] font-medium text-ink-3">{count}</span>}
      </h2>
      {action}
    </div>
  );
}

/* ─────────────────────────── Sheet ─────────────────────────── */

/**
 * Bottom sheet on phones, side drawer on desktop. Keeps the content mounted during the exit
 * transition so closing feels as smooth as opening.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  label,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  label: string;
  wide?: boolean;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [held, setHeld] = useState<React.ReactNode>(children);
  const panel = useRef<HTMLDivElement>(null);

  if (open && !mounted) setMounted(true);
  if (open && held !== children) setHeld(children);
  if (!open && shown) setShown(false);

  useEffect(() => {
    if (open) {
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    const t = setTimeout(() => setMounted(false), 420);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={label}>
      <div
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-[#1b1a18]/30 backdrop-blur-[3px] transition-opacity duration-400",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panel}
        tabIndex={-1}
        className={cx(
          "absolute flex flex-col bg-paper outline-none",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[28px] shadow-sheet transition-transform duration-500 ease-[var(--ease-out-quint)]",
          shown ? "translate-y-0" : "translate-y-full",
          // Desktop: right drawer
          "lg:inset-y-3 lg:right-3 lg:left-auto lg:max-h-none lg:rounded-[28px] lg:shadow-float",
          wide ? "lg:w-[520px]" : "lg:w-[440px]",
          shown ? "lg:translate-x-0" : "lg:translate-x-[calc(100%+24px)] lg:translate-y-0",
        )}
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 lg:hidden">
          <span className="h-1 w-10 rounded-full bg-line-2" />
        </div>
        {title !== undefined && (
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-2 pb-3 lg:px-6 lg:pt-6">
            <div className="min-w-0 flex-1">{title}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-2 text-ink-2 transition hover:bg-line hover:text-ink active:scale-90"
            >
              <I.X size={17} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(20px,env(safe-area-inset-bottom))]">
          {open ? children : held}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────── Count-up ─────────────────────────── */

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(a + (target - a) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target, duration]);
  return value;
}

export function Empty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center px-6 py-10 text-center animate-fade", className)}>
      <div className="relative mb-4 grid size-14 place-items-center rounded-full bg-surface text-ink-3 ring-1 ring-line">
        <span className="absolute -inset-2 rounded-full border border-dashed border-line-2" />
        {icon}
      </div>
      <p className="text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
      <p className="mt-1 max-w-[30ch] text-[13px] leading-relaxed text-ink-3">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
