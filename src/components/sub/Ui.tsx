import Link from "next/link";
import { IconArrow, IconChevron, IconSearch } from "@/components/Icons";

/* ── 소제목 ───────────────────────────────────────── */
export function SectionHeading({
  eyebrow,
  title,
  desc,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <p className="data-line text-flame-600">{eyebrow}</p>}
      <h2 className="mt-3 text-2xl font-bold text-navy-900 lg:text-2xl">{title}</h2>
      {desc && <p className="mt-3 max-w-3xl leading-relaxed text-ink-600">{desc}</p>}
      <span className="mt-6 block h-1 w-12 rounded-full bg-flame-500" />
    </div>
  );
}

/* ── 본문 텍스트 블록 ─────────────────────────────── */
const PROSE =
  "space-y-5 text-md leading-[1.85] text-ink-600 [&_b]:font-bold [&_b]:text-navy-900 [&_strong]:font-bold [&_strong]:text-navy-900";

/* html 을 주면 관리자 화면에서 고친 문구를 그대로 보여준다(저장할 때 걸러 둔 것). */
export function Prose({ children, html }: { children?: React.ReactNode; html?: string }) {
  if (html !== undefined) {
    return <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <div className={PROSE}>{children}</div>;
}

/* ── 강조 카드 ────────────────────────────────────── */
/* 병렬 항목 카드. 순서가 정보를 담지 않으므로 번호를 붙이지 않는다. */
export function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group rounded-xl border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]">
      <span className="block h-1 w-8 rounded-full bg-brand-200 transition-colors group-hover:bg-flame-500" />
      <p className="mt-5 text-lg font-bold leading-snug text-navy-900">{title}</p>
      <p className="mt-3 text-md leading-relaxed text-ink-600">{desc}</p>
    </div>
  );
}

/* ── 정의형 표 (주소·회비 등) ─────────────────────── */
export function DefTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="border-t-2 border-navy-900">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-col gap-1 border-b border-line py-4 sm:flex-row sm:gap-6 sm:py-5"
        >
          <dt className="w-full shrink-0 text-md font-bold text-navy-900 sm:w-44">
            {r.label}
          </dt>
          <dd className="text-md leading-relaxed text-ink-600">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── 진행 단계 ────────────────────────────────────── */
export function StepFlow({ steps }: { steps: { title: string; desc?: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="relative flex flex-col rounded-xl bg-surface p-6 ring-1 ring-line"
        >
          <span className="data-line text-flame-600">{i + 1}단계</span>
          <p className="mt-3 text-lg font-bold text-navy-900">{s.title}</p>
          {s.desc && <p className="mt-2 text-base leading-relaxed text-ink-600">{s.desc}</p>}
          {i < steps.length - 1 && (
            <IconChevron className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-brand-200 lg:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ── 게시판 검색 ──────────────────────────────────── */
export function BoardSearch({
  total,
  action,
  q = "",
}: {
  total: number;
  /** 검색 결과를 받을 경로. 예: /board/notice */
  action: string;
  q?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-base text-ink-600">
        전체 <b className="font-bold text-brand-600">{total}</b>건
      </p>
      <form
        className="flex w-full max-w-md gap-2 sm:w-auto"
        action={action}
        method="get"
        role="search"
        aria-label="게시물 검색"
      >
        <label htmlFor="board-q" className="sr-only">
          검색어
        </label>
        <input
          id="board-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="제목 검색"
          className="min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-2.5 text-base outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 sm:w-64"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-navy-900 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <IconSearch className="size-4" />
          검색
        </button>
      </form>
    </div>
  );
}

/* ── 페이지네이션 ─────────────────────────────────── */
export function Pagination({
  basePath,
  page,
  totalPages,
  q = "",
  /** 함께 유지할 조건 (예: 게시판 필터) */
  params: keep,
  /** 한 번에 보여줄 페이지 번호 개수 */
  window = 5,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  q?: string;
  params?: Record<string, string | undefined>;
  window?: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(keep ?? {})) {
      if (value) params.set(key, value);
    }
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  /* 현재 페이지가 가운데 오도록 번호 구간을 자른다. */
  const half = Math.floor(window / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - window + 1));
  const end = Math.min(totalPages, start + window - 1);
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const arrowClass =
    "grid size-10 place-items-center rounded-md text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";
  const disabledClass = "grid size-10 place-items-center rounded-md text-ink-400 ring-1 ring-line";

  return (
    <nav className="mt-12 flex justify-center gap-1" aria-label="페이지 목록">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="이전 페이지" className={arrowClass}>
          <IconChevron className="size-4 rotate-180" />
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          <IconChevron className="size-4 rotate-180" />
        </span>
      )}

      {numbers.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`label-mono grid size-10 place-items-center rounded-md text-sm tabular-nums transition-colors ${
            p === page
              ? "bg-navy-900 text-white"
              : "text-ink-600 ring-1 ring-line hover:bg-surface"
          }`}
        >
          {p}
        </Link>
      ))}

      {page < totalPages ? (
        <Link href={href(page + 1)} aria-label="다음 페이지" className={arrowClass}>
          <IconChevron className="size-4" />
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          <IconChevron className="size-4" />
        </span>
      )}
    </nav>
  );
}

/* ── 하단 문의 배너 ───────────────────────────────── */
export function ContactBanner({
  title = "문의가 필요하신가요?",
  desc = "조합 사무국이 회원사 가입과 사업 참여를 안내해 드립니다.",
  href = "/about/location",
  cta = "찾아오시는 길",
  spacing = "normal",
}: {
  title?: string;
  desc?: string;
  href?: string;
  cta?: string;
  /** 바로 위에 다른 띠가 있으면 tight 로 붙인다. 사이가 비어 보이지 않게. */
  spacing?: "normal" | "tight";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy-900 px-8 py-10 lg:px-12 ${
        spacing === "tight" ? "mt-5" : "mt-11"
      }`}
    >
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xl font-bold text-white">{title}</p>
          <p className="mt-2 text-md text-brand-100/70">{desc}</p>
        </div>
        <Link
          href={href}
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-flame-500 px-6 py-3.5 text-md font-bold text-white transition-colors hover:bg-flame-600"
        >
          {cta}
          <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
