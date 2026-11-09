import type { Metadata } from "next";
import Link from "next/link";
import { IconExternal } from "@/components/admin/AdminIcons";
import { Empty, PageHead, btnGhost, btnPrimary, inputBox } from "@/components/admin/AdminUi";
import HistoryEditor from "@/components/admin/HistoryEditor";
import { listHistory, listHistoryYears } from "@/lib/db/about-content";

export const metadata: Metadata = { title: "연혁 관리" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; add?: string }>;
}) {
  const saved = await listHistoryYears();
  const sp = await searchParams;

  /*
    새 연도. 연도 단추는 연혁이 있는 해만 나와서, 아직 한 건도 없는 해(예: 2024년)는 고를 수가
    없었다(2026-11-09 사무국). 아래 '새 연도 추가'로 고른 해는 비어 있어도 단추에 올리고 편집기를 연다.
    그 해에 첫 항목을 넣으면 맨 위에 놓인다(최근 연도가 위).
  */
  const added = /^\d{4}$/.test(sp.add ?? "")
    ? `${sp.add}년`
    : /^\d{4}년$/.test(sp.year ?? "") && !saved.some((y) => y.year === sp.year)
      ? sp.year!
      : "";
  const years =
    added && !saved.some((y) => y.year === added) ? [{ year: added, count: 0 }, ...saved] : saved;
  const year = added || (years.find((y) => y.year === sp.year)?.year ?? years[0]?.year ?? "");
  const entries = year ? await listHistory(year) : [];

  return (
    <div className="space-y-6">
      <PageHead
        title="연혁 관리"
        desc="설립목적 및 연혁 화면의 연도별 활동입니다. 새 항목은 그 연도의 맨 위에 놓이고, 끌어서 차례를 바꿉니다."
        actions={
          <>
            <Link
              href="/about/history"
              target="_blank"
              className={`flex items-center gap-2 ${btnGhost}`}
            >
              <IconExternal className="size-4" />
              화면에서 보기
            </Link>
            <Link href="/admin/pages" className={btnPrimary}>
              소개 페이지 문구
            </Link>
          </>
        }
      />

      {/* 연도 고르기 — 연도가 많아 알약 단추로 늘어놓는다 */}
      <div className="flex flex-wrap items-center gap-2">
        {years.map((y) => (
          <Link
            key={y.year}
            href={`/admin/pages/history?year=${encodeURIComponent(y.year)}`}
            aria-current={y.year === year ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
              y.year === year
                ? "bg-navy-900 text-white"
                : "border border-line bg-white text-ink-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {y.year}
            <span
              className={`ml-1.5 tabular-nums ${y.year === year ? "opacity-70" : "text-ink-400"}`}
            >
              {y.count}
            </span>
          </Link>
        ))}

        {/* 아직 연혁이 없는 해를 연다 */}
        <form method="get" className="ml-auto flex items-center gap-2">
          <label htmlFor="history-add-year" className="text-base font-semibold text-ink-600">
            새 연도
          </label>
          <input
            id="history-add-year"
            name="add"
            type="number"
            min={1990}
            max={2100}
            required
            defaultValue={Number((saved[0]?.year ?? "2025년").slice(0, 4)) + 1}
            className={`${inputBox} w-28`}
          />
          <button type="submit" className={btnGhost}>
            연도 추가
          </button>
        </form>
      </div>

      {year ? (
        <HistoryEditor key={year} year={year} entries={entries} />
      ) : (
        <Empty>등록된 연혁이 없습니다.</Empty>
      )}
    </div>
  );
}
