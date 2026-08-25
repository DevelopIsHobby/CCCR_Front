"use client";

import { useState } from "react";
import { HISTORY } from "@/lib/page-data";

const countOf = (y: (typeof HISTORY)[number]) =>
  y.months.reduce((n, m) => n + m.events.length, 0);

export default function HistoryTimeline() {
  const [year, setYear] = useState(HISTORY[0].year);
  const active = HISTORY.find((h) => h.year === year) ?? HISTORY[0];

  return (
    <div>
      {/*
        연도가 15개다. 가로 스크롤을 쓰면 잘린 탭이 보이지 않으므로
        좁은 화면은 드롭다운, 그 위로는 전부 펼친 알약 버튼을 쓴다.
      */}
      <div className="sm:hidden">
        <label htmlFor="history-year" className="sr-only">
          연도 선택
        </label>
        <select
          id="history-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-4 py-3.5 text-md font-bold text-navy-900 outline-none focus:border-brand-500"
        >
          {HISTORY.map((h) => (
            <option key={h.year} value={h.year}>
              {h.year} ({countOf(h)}건)
            </option>
          ))}
        </select>
      </div>

      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {HISTORY.map((h) => (
          <button
            key={h.year}
            type="button"
            onClick={() => setYear(h.year)}
            aria-pressed={h.year === year}
            className={`rounded-full px-4 py-2.5 text-base font-semibold transition-colors ${
              h.year === year
                ? "bg-navy-900 text-white"
                : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {h.year}
          </button>
        ))}
      </div>

      {/* 선택한 연도의 월별 활동 */}
      <div className="mt-10 flex items-baseline gap-3 border-b-2 border-navy-900 pb-4">
        <h3 className="text-xl font-bold text-navy-900">{active.year}</h3>
        <span className="data-line text-ink-400">{countOf(active)}건</span>
      </div>

      <div>
        {active.months.map((m) => (
          <div
            key={m.month}
            className="grid gap-x-10 border-b border-line py-7 lg:grid-cols-[88px_1fr]"
          >
            <p className="label-mono text-xl font-bold tabular-nums leading-none text-brand-200 lg:text-3xl">
              {m.month}
            </p>

            <ul className="mt-4 space-y-4 lg:mt-1">
              {m.events.map((e, i) => (
                <li
                  key={`${m.month}-${i}`}
                  className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="text-md leading-relaxed text-ink-900">{e.title}</span>
                  {e.place && (
                    <span className="shrink-0 text-sm text-ink-400 sm:w-56 sm:text-right">
                      {e.place}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
