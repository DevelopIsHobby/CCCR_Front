/*
  관리자 화면 전용 아이콘.
  사이트 쪽 Icons.tsx 와 같은 규칙(24 격자·1.5 선)으로 그려 두 곳의 인상이 어긋나지 않게 한다.
*/
type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

function IconGauge({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 14.5 15.5 10" />
      <circle cx="12" cy="15.5" r="1.4" />
    </svg>
  );
}

function IconLayout({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M9.5 9.5V20" />
    </svg>
  );
}

function IconDoc({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  );
}

function IconBook({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M15 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="9.5" cy="7.5" r="3" />
      <path d="M17 13.8a3.5 3.5 0 0 1 3 3.45V19M15.5 5.2a3 3 0 0 1 0 5.6" />
    </svg>
  );
}

function IconBuilding({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 21V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15" />
      <path d="M14 10h5a1 1 0 0 1 1 1v10M3 21h18" />
      <path d="M7.5 9h3M7.5 13h3M17 14h.01M17 17.5h.01" />
    </svg>
  );
}

function IconMailOpen({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3 10.5 12 4l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="m3 10.5 9 6 9-6" />
    </svg>
  );
}

function IconGlobe({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

function IconFolder({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function IconChart({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 20v-6M12.5 20V9M17 20v-8" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6z" />
      <path d="m9.3 12 1.9 1.9 3.5-3.6" />
    </svg>
  );
}

function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      <path d="M7.5 13h3v3h-3z" />
    </svg>
  );
}

const ICONS = {
  gauge: IconGauge,
  layout: IconLayout,
  doc: IconDoc,
  book: IconBook,
  users: IconUsers,
  building: IconBuilding,
  mail: IconMailOpen,
  globe: IconGlobe,
  folder: IconFolder,
  chart: IconChart,
  shield: IconShield,
  calendar: IconCalendar,
};

export type AdminIconName = keyof typeof ICONS;

/** 내비게이션 데이터가 이름만 들고 다니고, 그림은 여기서 고른다. */
export function AdminIcon({ name, className }: { name: AdminIconName; className?: string }) {
  const Cmp = ICONS[name];
  return <Cmp className={className} />;
}

export function IconExternal({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.2h.01" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.2 2.6 2.6 5-5.2" />
    </svg>
  );
}
