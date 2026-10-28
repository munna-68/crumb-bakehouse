import type { SVGProps } from "react";
import type { Glyph } from "../_lib/types";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const I = {
  Today: (p: P) => (
    <Base {...p}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </Base>
  ),
  Orders: (p: P) => (
    <Base {...p}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 9.5h8M8 13h8M8 16.5h4.5" />
    </Base>
  ),
  Insights: (p: P) => (
    <Base {...p}>
      <path d="M5 19V13M10 19V8M15 19v-4M20 19V5" />
    </Base>
  ),
  Shop: (p: P) => (
    <Base {...p}>
      <path d="M4.5 9.5 6 4.5h12l1.5 5" />
      <path d="M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
      <path d="M5.5 12v7.5h13V12M10 19.5v-4h4v4" />
    </Base>
  ),
  Bell: (p: P) => (
    <Base {...p}>
      <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </Base>
  ),
  Check: (p: P) => (
    <Base {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  ),
  X: (p: P) => (
    <Base {...p}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Base>
  ),
  Clock: (p: P) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" />
    </Base>
  ),
  Calendar: (p: P) => (
    <Base {...p}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="3.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </Base>
  ),
  Move: (p: P) => (
    <Base {...p}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="3.5" />
      <path d="M8.5 3.5v4M15.5 3.5v4M9 14h6m-2-2.2L15 14l-2 2.2" />
    </Base>
  ),
  ChevronRight: (p: P) => (
    <Base {...p}>
      <path d="m10 6.5 5.5 5.5-5.5 5.5" />
    </Base>
  ),
  ChevronLeft: (p: P) => (
    <Base {...p}>
      <path d="M14 6.5 8.5 12l5.5 5.5" />
    </Base>
  ),
  ChevronDown: (p: P) => (
    <Base {...p}>
      <path d="m6.5 10 5.5 5.5 5.5-5.5" />
    </Base>
  ),
  Plus: (p: P) => (
    <Base {...p}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Base>
  ),
  Minus: (p: P) => (
    <Base {...p}>
      <path d="M5.5 12h13" />
    </Base>
  ),
  ArrowUpRight: (p: P) => (
    <Base {...p}>
      <path d="M7.5 16.5 16.5 7.5M9 7.5h7.5V15" />
    </Base>
  ),
  ArrowRight: (p: P) => (
    <Base {...p}>
      <path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" />
    </Base>
  ),
  Note: (p: P) => (
    <Base {...p}>
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h0a2 2 0 0 1-2-2z" />
    </Base>
  ),
  Phone: (p: P) => (
    <Base {...p}>
      <path d="M6.5 4.5h3l1.5 4-2 1.2a10 10 0 0 0 5.3 5.3l1.2-2 4 1.5v3A1.5 1.5 0 0 1 18 19C10.8 19 5 13.2 5 6a1.5 1.5 0 0 1 1.5-1.5z" />
    </Base>
  ),
  More: (p: P) => (
    <Base {...p}>
      <circle cx="6" cy="12" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <circle cx="18" cy="12" r="0.9" fill="currentColor" />
    </Base>
  ),
  Trend: (p: P) => (
    <Base {...p}>
      <path d="m4.5 16 5-5 3.5 3.5 6.5-6.5M15 8h4.5v4.5" />
    </Base>
  ),
  Alert: (p: P) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5M12 15.8v.2" />
    </Base>
  ),
  Star: (p: P) => (
    <Base {...p}>
      <path d="m12 4.5 2.3 4.7 5.2.8-3.8 3.6.9 5.2L12 16.4l-4.6 2.4.9-5.2-3.8-3.6 5.2-.8z" />
    </Base>
  ),
  Bank: (p: P) => (
    <Base {...p}>
      <path d="M4 9.5 12 5l8 4.5M5.5 10v7M10 10v7M14 10v7M18.5 10v7M4 19.5h16" />
    </Base>
  ),
  Spark: (p: P) => (
    <Base {...p}>
      <path d="M12 4.5c.6 3.8 3.7 6.9 7.5 7.5-3.8.6-6.9 3.7-7.5 7.5-.6-3.8-3.7-6.9-7.5-7.5 3.8-.6 6.9-3.7 7.5-7.5z" />
    </Base>
  ),
  Pause: (p: P) => (
    <Base {...p}>
      <path d="M9 6.5v11M15 6.5v11" />
    </Base>
  ),
  Trash: (p: P) => (
    <Base {...p}>
      <path d="M5 7h14M10 4.5h4M7 7l.8 11.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L17 7" />
    </Base>
  ),
  Eye: (p: P) => (
    <Base {...p}>
      <path d="M3.5 12S6.5 6 12 6s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </Base>
  ),
  Edit: (p: P) => (
    <Base {...p}>
      <path d="M5 19h3.5L18.5 9 15 5.5 5 15.5zM13 7.5 16.5 11" />
    </Base>
  ),
  Lock: (p: P) => (
    <Base {...p}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Base>
  ),
  Leaf: (p: P) => (
    <Base {...p}>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7" />
    </Base>
  ),
  Logout: (p: P) => (
    <Base {...p}>
      <path d="M14 5h3.5A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h9" />
    </Base>
  ),
};

/** Small line illustrations for menu items. Drawn on a 48 grid. */
export function FoodGlyph({ glyph, size = 28, className }: { glyph: Glyph; size?: number; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<Glyph, React.ReactNode> = {
    loaf: (
      <>
        <path d="M8 30c0-9 7.2-15 16-15s16 6 16 15c0 3-2 5-5 5H13c-3 0-5-2-5-5z" {...common} />
        <path d="M17 21.5l3 4M24 19.5l3 4.5M31 21.5l2.5 4" {...common} />
      </>
    ),
    rye: (
      <>
        <rect x="9" y="17" width="30" height="16" rx="7" {...common} />
        <circle cx="17" cy="24" r="0.6" fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="23" cy="27" r="0.6" fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="29" cy="23" r="0.6" fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="33" cy="27.5" r="0.6" fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="20" cy="21.5" r="0.6" fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
      </>
    ),
    focaccia: (
      <>
        <rect x="8" y="14" width="32" height="20" rx="4" {...common} />
        <path d="M15 20.5h.01M23 19.5h.01M31 21h.01M18 27.5h.01M27 27h.01M34 28h.01" {...common} strokeWidth={3} />
        <path d="M20 23.5c2-1 3.5-.5 5 .5" {...common} />
      </>
    ),
    bun: (
      <>
        <path d="M24 13c6 0 11 4.5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" {...common} />
        <path d="M24 18c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6c0-2.2 1.8-4 4-4s3 1.3 3 3-1 2-2 2" {...common} />
      </>
    ),
    croissant: (
      <>
        <path d="M7 29c3-9 10-14 17-14s14 5 17 14c-3 1.5-6 1.5-8 0-2.5 3-6 4-9 4s-6.5-1-9-4c-2 1.5-5 1.5-8 0z" {...common} />
        <path d="M18 18.5l2 12M30 18.5l-2 12M24 15v18" {...common} />
      </>
    ),
    cookie: (
      <>
        <circle cx="24" cy="24" r="12.5" {...common} />
        <path d="M19 19.5h.01M27.5 18.5h.01M30 26.5h.01M21 28.5h.01M25 24h.01" {...common} strokeWidth={3.4} />
      </>
    ),
    galette: (
      <>
        <path d="M10 26c0-7 6.3-12 14-12s14 5 14 12c0 4.5-6.3 8-14 8s-14-3.5-14-8z" {...common} />
        <path d="M17 24.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5c-2 1.8-4.5 2.5-7 2.5s-5-.7-7-2.5z" {...common} />
        <path d="M24 20v-2.5" {...common} />
      </>
    ),
    cake: (
      <>
        <path d="M11 24h26v11H11z" {...common} />
        <path d="M11 28.5c3 2 6 2 8.7 0s6-2 8.6 0 5.7 2 8.7 0" {...common} />
        <path d="M24 24v-5M24 15.5c-1.2-1.3-1.2-2.6 0-4 1.2 1.4 1.2 2.7 0 4z" {...common} />
        <path d="M8 35h32" {...common} />
      </>
    ),
    pumpkin: (
      <>
        <rect x="9" y="19" width="30" height="15" rx="4" {...common} />
        <path d="M14 19v-1.5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3V19" {...common} />
        <path d="M24 14.5c0-2 1-3.5 3-4" {...common} />
        <path d="M15 26.5c3-1.5 6 1.5 9 0s6-1.5 9 0" {...common} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={className}>
      {paths[glyph]}
    </svg>
  );
}
