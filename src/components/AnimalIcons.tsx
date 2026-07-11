// Outline animal icons matching the BottomNav MosqueIcon style:
// stroke-only, currentColor, strokeWidth 1.8, round caps/joins.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
};

export const GoatIcon = ({ className, ...rest }: IconProps) => (
  <svg {...base} className={className} {...rest}>
    {/* horns */}
    <path d="M11 8c-1-2-1-4 0-5M15 8c0-2 .5-4 1.5-5" />
    {/* head */}
    <path d="M9 14c0-3 2.5-5 5-5s5 2 5 5v2h-2l-1 3h-4l-1-3H9z" />
    {/* eye + beard */}
    <circle cx="11.5" cy="12.5" r=".6" fill="currentColor" stroke="none" />
    <path d="M14 19v3" />
    {/* body & legs */}
    <path d="M9 18h14v6H9z" />
    <path d="M11 24v3M15 24v3M19 24v3M23 24v3" />
    {/* tail */}
    <path d="M23 19l3-1" />
  </svg>
);

export const SheepIcon = ({ className, ...rest }: IconProps) => (
  <svg {...base} className={className} {...rest}>
    {/* fluffy head */}
    <circle cx="10" cy="12" r="3" />
    <circle cx="8" cy="10" r="1.4" />
    <circle cx="12.5" cy="9.5" r="1.4" />
    <circle cx="11.5" cy="12" r=".6" fill="currentColor" stroke="none" />
    {/* cloud-like body */}
    <path d="M13 17c-2 0-3 1.3-3 2.7 0 .5-1 .5-1.4 1a2.2 2.2 0 0 0 1.6 3.8h13a2.5 2.5 0 0 0 .8-4.9c.2-1.5-.9-2.9-2.5-2.9-.5 0-1 .1-1.4.3A3.4 3.4 0 0 0 17 15c-1.6 0-3 .9-3.6 2.2A2.5 2.5 0 0 0 13 17z" />
    {/* legs */}
    <path d="M12 24v3M16 24v3M20 24v3M24 24v3" />
  </svg>
);

export const CowIcon = ({ className, ...rest }: IconProps) => (
  <svg {...base} className={className} {...rest}>
    {/* horns */}
    <path d="M9 8c-1.5-1-2.5-2.5-2.5-4M15 8c1.5-1 2.5-2.5 2.5-4" />
    {/* head */}
    <path d="M8 12c0-2.5 2-4.5 4-4.5s4 2 4 4.5v3l-2 2h-4l-2-2z" />
    <circle cx="10" cy="12" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r=".6" fill="currentColor" stroke="none" />
    <path d="M11 15h2" />
    {/* body */}
    <path d="M6 18h18a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
    {/* spot */}
    <path d="M16 20.5c1 0 1.6.6 1.6 1.3s-.7 1.2-1.6 1.2-1.6-.5-1.6-1.2.7-1.3 1.6-1.3z" />
    {/* legs + tail */}
    <path d="M8 24v3M12 24v3M20 24v3M24 24v3" />
    <path d="M26 21l2-1" />
  </svg>
);

export const CamelIcon = ({ className, ...rest }: IconProps) => (
  <svg {...base} className={className} {...rest}>
    {/* head */}
    <path d="M6 10c0-1.5 1-2.8 2.5-2.8S11 8.5 11 10v2" />
    <circle cx="7.5" cy="9.5" r=".6" fill="currentColor" stroke="none" />
    {/* neck */}
    <path d="M9 12c-.5 2 .5 4 2 5" />
    {/* humps + back */}
    <path d="M11 17c1-3 3.5-3 4.5 0 1-3 3.5-3 4.5 0 .5 1.5 2 1.8 3.5 1.8h2" />
    {/* belly */}
    <path d="M11 17c-.3 2 .5 3.5 2 4.5h11" />
    {/* legs */}
    <path d="M13 22v5M16 22v5M21 22v5M24 22v5" />
    {/* tail */}
    <path d="M25 20l2-1" />
  </svg>
);

export const animalIconMap = {
  kambing: GoatIcon,
  domba: SheepIcon,
  sapi: CowIcon,
  unta: CamelIcon,
} as const;
