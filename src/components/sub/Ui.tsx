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
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 text-md leading-[1.85] text-ink-600 [&_b]:font-bold [&_b]:text-navy-900 [&_strong]:font-bold [&_strong]:text-navy-900">
      {children}
    </div>
  );
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
export function StepFlow({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="relative flex flex-col rounded-xl bg-surface p-6 ring-1 ring-line"
        >
          <span className="data-line text-flame-600">{i + 1}단계</span>
          <p className="mt-3 text-lg font-bold text-navy-900">{s.title}</p>
          <p className="mt-2 text-base leading-relaxed text-ink-600">{s.desc}</p>
          {i < steps.length - 1 && (
            <IconChevron className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-brand-200 lg:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ── 게시판 검색 ──────────────────────────────────── */
export function BoardSearch({ total }: { total: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-base text-ink-600">
        전체 <b className="font-bold text-brand-600">{total}</b>건
      </p>
      <form
        className="flex w-full max-w-md gap-2 sm:w-auto"
        action="#"
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
          placeholder="제목 또는 기관명 검색"
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

/* ── 페이지네이션 (정적 UI) ───────────────────────── */
export function Pagination({ pages = 5, current = 1 }: { pages?: number; current?: number }) {
  return (
    <nav className="mt-12 flex justify-center gap-1" aria-label="페이지 목록">
      <span
        aria-disabled
        className="grid size-10 place-items-center rounded-md text-ink-400 ring-1 ring-line"
      >
        <IconChevron className="size-4 rotate-180" />
      </span>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href="#"
          aria-current={p === current ? "page" : undefined}
          className={`label-mono grid size-10 place-items-center rounded-md text-sm tabular-nums transition-colors ${
            p === current
              ? "bg-navy-900 text-white"
              : "text-ink-600 ring-1 ring-line hover:bg-surface"
          }`}
        >
          {p}
        </Link>
      ))}
      <span className="grid size-10 place-items-center rounded-md text-ink-600 ring-1 ring-line">
        <IconChevron className="size-4" />
      </span>
    </nav>
  );
}

/* ── 하단 문의 배너 ───────────────────────────────── */
export function ContactBanner({
  title = "문의가 필요하신가요?",
  desc = "조합 사무국이 회원사 가입과 사업 참여를 안내해 드립니다.",
  href = "/about/location",
  cta = "찾아오시는 길",
}: {
  title?: string;
  desc?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="relative mt-20 overflow-hidden rounded-2xl bg-navy-900 px-8 py-10 lg:px-12">
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
