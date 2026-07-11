// Outline animal icons matching the BottomNav MosqueIcon style:
// stroke-only, currentColor, strokeWidth 1.8, round caps/joins.
//
// Standard size tokens (use these — do NOT override h-/w- per instance):
//   icon-sm  = h-4 w-4  (inline w/ text, buttons)
//   icon-md  = h-6 w-6  (nav, form controls)
//   icon-lg  = h-7 w-7  (feature tiles, animal picker)
//
// Accessibility: pass `label` to expose the icon to screen readers
// (renders <title> + role="img"). Omit `label` for purely decorative use;
// the SVG then stays aria-hidden.
import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "aria-label"> & {
  className?: string;
  label?: string;
};

// Fixed at 1.8 across every breakpoint — no responsive override permitted.
const STROKE_WIDTH = 1.8;

const baseSvgProps = (label?: string) => ({
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...(label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const, focusable: false as const, role: "presentation" as const }),
});

export const GoatIcon = ({ className, label, ...rest }: IconProps) => (
  <svg {...baseSvgProps(label)} className={className} {...rest}>
    {label ? <title>{label}</title> : null}
    <path d="M11 8c-1-2-1-4 0-5M15 8c0-2 .5-4 1.5-5" />
    <path d="M9 14c0-3 2.5-5 5-5s5 2 5 5v2h-2l-1 3h-4l-1-3H9z" />
    <circle cx="11.5" cy="12.5" r=".6" fill="currentColor" stroke="none" />
    <path d="M14 19v3" />
    <path d="M9 18h14v6H9z" />
    <path d="M11 24v3M15 24v3M19 24v3M23 24v3" />
    <path d="M23 19l3-1" />
  </svg>
);

export const SheepIcon = ({ className, label, ...rest }: IconProps) => (
  <svg {...baseSvgProps(label)} className={className} {...rest}>
    {label ? <title>{label}</title> : null}
    <circle cx="10" cy="12" r="3" />
    <circle cx="8" cy="10" r="1.4" />
    <circle cx="12.5" cy="9.5" r="1.4" />
    <circle cx="11.5" cy="12" r=".6" fill="currentColor" stroke="none" />
    <path d="M13 17c-2 0-3 1.3-3 2.7 0 .5-1 .5-1.4 1a2.2 2.2 0 0 0 1.6 3.8h13a2.5 2.5 0 0 0 .8-4.9c.2-1.5-.9-2.9-2.5-2.9-.5 0-1 .1-1.4.3A3.4 3.4 0 0 0 17 15c-1.6 0-3 .9-3.6 2.2A2.5 2.5 0 0 0 13 17z" />
    <path d="M12 24v3M16 24v3M20 24v3M24 24v3" />
  </svg>
);

export const CowIcon = ({ className, label, ...rest }: IconProps) => (
  <svg {...baseSvgProps(label)} className={className} {...rest}>
    {label ? <title>{label}</title> : null}
    <path d="M9 8c-1.5-1-2.5-2.5-2.5-4M15 8c1.5-1 2.5-2.5 2.5-4" />
    <path d="M8 12c0-2.5 2-4.5 4-4.5s4 2 4 4.5v3l-2 2h-4l-2-2z" />
    <circle cx="10" cy="12" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r=".6" fill="currentColor" stroke="none" />
    <path d="M11 15h2" />
    <path d="M6 18h18a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
    <path d="M16 20.5c1 0 1.6.6 1.6 1.3s-.7 1.2-1.6 1.2-1.6-.5-1.6-1.2.7-1.3 1.6-1.3z" />
    <path d="M8 24v3M12 24v3M20 24v3M24 24v3" />
    <path d="M26 21l2-1" />
  </svg>
);

export const CamelIcon = ({ className, label, ...rest }: IconProps) => (
  <svg {...baseSvgProps(label)} className={className} {...rest}>
    {label ? <title>{label}</title> : null}
    <path d="M6 10c0-1.5 1-2.8 2.5-2.8S11 8.5 11 10v2" />
    <circle cx="7.5" cy="9.5" r=".6" fill="currentColor" stroke="none" />
    <path d="M9 12c-.5 2 .5 4 2 5" />
    <path d="M11 17c1-3 3.5-3 4.5 0 1-3 3.5-3 4.5 0 .5 1.5 2 1.8 3.5 1.8h2" />
    <path d="M11 17c-.3 2 .5 3.5 2 4.5h11" />
    <path d="M13 22v5M16 22v5M21 22v5M24 22v5" />
    <path d="M25 20l2-1" />
  </svg>
);

export const animalIconMap = {
  kambing: GoatIcon,
  domba: SheepIcon,
  sapi: CowIcon,
  unta: CamelIcon,
} as const;

export const animalIconLabels: Record<keyof typeof animalIconMap, string> = {
  kambing: "Ikon kambing",
  domba: "Ikon domba",
  sapi: "Ikon sapi",
  unta: "Ikon unta",
};
