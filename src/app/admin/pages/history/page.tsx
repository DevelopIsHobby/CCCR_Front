import type { Metadata } from "next";
import Link from "next/link";
import HistoryEditor from "@/components/admin/HistoryEditor";
import { listHistory, listHistoryYears } from "@/lib/db/about-content";

export const metadata: Metadata = { title: "연혁 관리" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const years = await listHistoryYears();
  const sp = await searchParams;
  const year = years.find((y) => y.year === sp.year)?.year ?? years[0]?.year ?? "";
  const entries = year ? await listHistory(year) : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">연혁 관리</h1>
          <p className="mt-2 text-md text-ink-600">
            설립목적 및 연혁 화면의 연도별 활동입니다. 새 항목은 그 연도의 맨 위에 놓이고, 끌어서
            차례를 바꿉니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/about/history"
            target="_blank"
            className="rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
          >
            화면에서 보기 ↗
          </Link>
          <Link
            href="/admin/pages"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            소개 페이지 문구
          </Link>
        </div>
      </div>

      {/* 연도 고르기 — 연도가 많아 알약 단추로 늘어놓는다 */}
      <div className="mt-8 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link
            key={y.year}
            href={`/admin/pages/history?year=${encodeURIComponent(y.year)}`}
            aria-current={y.year === year ? "page" : undefined}
            className={`rounded-full px-4 py-2.5 text-base font-semibold transition-colors ${
              y.year === year
                ? "bg-navy-900 text-white"
                : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {y.year}
            <span className="ml-1.5 tabular-nums opacity-70">{y.count}</span>
          </Link>
        ))}
      </div>

      {year ? (
        <HistoryEditor key={year} year={year} entries={entries} />
      ) : (
        <p className="mt-10 rounded-lg bg-surface px-6 py-5 text-md text-ink-600">
          등록된 연혁이 없습니다.
        </p>
      )}
    </>
  );
}
