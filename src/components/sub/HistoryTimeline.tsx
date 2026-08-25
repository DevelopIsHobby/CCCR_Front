"use client";

import { useState } from "react";
import { HISTORY } from "@/lib/page-data";

export default function HistoryTimeline() {
  const [year, setYear] = useState(HISTORY[0].year);
  const active = HISTORY.find((h) => h.year === year) ?? HISTORY[0];
  const count = active.months.reduce((n, m) => n + m.events.length, 0);

  return (
    <div>
      {/* 연도 선택 */}
      <div className="flex flex-wrap items-center gap-2">
        {HISTORY.map((h) => (
          <button
            key={h.year}
            type="button"
            onClick={() => setYear(h.year)}
            aria-pressed={h.year === year}
            className={`rounded-full px-5 py-2.5 text-base font-semibold transition-colors ${
              h.year === year
                ? "bg-navy-900 text-white"
                : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {h.year}년
          </button>
        ))}
        <span className="data-line ml-1 text-ink-400">{count}건</span>
      </div>

      {/* 월별 활동 */}
      <div className="mt-10 border-t-2 border-navy-900">
        {active.months.map((m) => (
          <div
            key={m.month}
            className="grid gap-x-10 border-b border-line py-7 lg:grid-cols-[88px_1fr]"
          >
            <p className="label-mono text-xl font-bold tabular-nums leading-none text-brand-200 lg:text-3xl">
              {m.month}
            </p>

            <ul className="mt-4 space-y-4 lg:mt-1">
              {m.events.map((e) => (
                <li
                  key={e.title}
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
