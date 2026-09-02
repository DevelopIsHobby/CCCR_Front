import Link from "next/link";
import { IconAlert } from "@/components/admin/AdminIcons";

/*
  관리자 화면 공통 조각.
  본문 바탕이 회색이고 내용은 흰 판 위에 올리는 규칙을 여기서 한 번만 정한다.
*/

/** 화면 맨 위 제목 줄. 오른쪽에 단추를 둘 수 있다. */
export function PageHead({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {desc && <p className="mt-2 max-w-3xl text-md text-ink-600">{desc}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** 흰 판. 제목을 주면 머리글이 붙는다. */
export function Panel({
  title,
  desc,
  actions,
  bare,
  className = "",
  children,
}: {
  title?: string;
  desc?: React.ReactNode;
  actions?: React.ReactNode;
  /** 안쪽 여백을 없앤다. 표를 판 끝까지 붙일 때 쓴다. */
  bare?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)] ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 lg:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-bold text-navy-900">{title}</h2>}
            {desc && <p className="mt-1 text-base text-ink-600">{desc}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={bare ? "" : "px-5 py-5 lg:px-6"}>{children}</div>
    </section>
  );
}

/** 숫자 한 개짜리 카드. */
export function StatCard({
  label,
  value,
  unit,
  note,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  unit?: string;
  note?: React.ReactNode;
  /** 눈에 띄게 할 카드(처리할 일이 남은 경우) */
  accent?: boolean;
  href?: string;
}) {
  const body = (
    <>
      <p className={`text-base font-medium ${accent ? "text-flame-700" : "text-ink-600"}`}>
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-navy-900">
        <span className="tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="ml-1 text-base font-medium text-ink-400">{unit}</span>}
      </p>
      {note && (
        <p className={`mt-2 text-sm ${accent ? "font-semibold text-flame-600" : "text-ink-400"}`}>
          {note}
        </p>
      )}
    </>
  );

  const shell = `block rounded-xl border p-5 transition-colors ${
    accent ? "border-flame-500/50 bg-flame-100/40" : "border-line bg-white"
  } ${href ? "hover:border-brand-500" : ""}`;

  return href ? (
    <Link href={href} className={shell}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

/** 안내 문구. 회색 바탕 위에서도 읽히도록 흰 판에 테두리를 둔다. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-white px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
      {children}
    </p>
  );
}

/** 아직 아무것도 없을 때. */
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white px-6 py-12 text-md text-ink-400">
      <IconAlert className="size-[18px]" />
      {children}
    </p>
  );
}

/* 화면마다 되풀이되던 단추·입력칸 모양. 클래스 문자열로 두어 form 안에서 바로 쓴다. */
export const btnPrimary =
  "rounded-lg bg-navy-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-600";

export const btnGhost =
  "rounded-lg border border-line bg-white px-4 py-2.5 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600";

export const inputBox =
  "rounded-lg border border-line bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-brand-500";

/** 알약 모양 필터 한 벌을 감싸는 상자 */
export const pillGroup = "flex flex-wrap gap-1 rounded-full border border-line bg-white p-1";

export function pillClass(active: boolean) {
  return `rounded-full px-4 py-2 text-base font-semibold transition-colors ${
    active ? "bg-navy-900 text-white" : "text-ink-600 hover:bg-surface hover:text-brand-600"
  }`;
}
