type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconMember({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M16 19v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V19" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M17 11h4M19 9v4" />
    </svg>
  );
}

export function IconArchive({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function IconClass({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3 6.5 12 3l9 3.5-9 3.5z" />
      <path d="M7 9v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V9" />
      <path d="M21 6.5V13" />
    </svg>
  );
}

export function IconBusiness({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h3v3H8z" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

export function IconPause({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9.5 5v14M14.5 5v14" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M8 5.5 18 12 8 18.5z" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export const QUICK_ICONS = {
  member: IconMember,
  archive: IconArchive,
  class: IconClass,
  business: IconBusiness,
  calendar: IconCalendar,
  mail: IconMail,
} as const;

export function IconClip({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M18 8.5 10.4 16a2.6 2.6 0 0 1-3.7-3.7l7.9-7.9a4.1 4.1 0 0 1 5.8 5.8l-7.9 7.9a5.6 5.6 0 0 1-7.9-7.9L11 3.9" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
