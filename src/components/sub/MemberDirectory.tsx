"use client";

import { useState } from "react";
import { MEMBER_GROUPS } from "@/lib/page-data";

/*
  원 사이트와 같은 3개 구분을 유지한다.
  이사장사는 1개사뿐이라 임원사와 한 탭에 묶는다.
*/
const TABS: { label: string; grades: string[] }[] = [
  { label: "이사장사·임원사", grades: ["이사장사", "임원사"] },
  { label: "일반회원사", grades: ["일반회원사"] },
  { label: "준회원사", grades: ["준회원사"] },
];

const groupsOf = (grades: string[]) =>
  MEMBER_GROUPS.filter((g) => grades.includes(g.grade));

const countOf = (grades: string[]) =>
  groupsOf(grades).reduce((n, g) => n + g.members.length, 0);

export default function MemberDirectory() {
  const [tab, setTab] = useState(TABS[0].label);
  const active = TABS.find((t) => t.label === tab) ?? TABS[0];

  return (
    <div>
      {/* 구분 선택 */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setTab(t.label)}
            aria-pressed={t.label === tab}
            className={`rounded-full px-5 py-2.5 text-base font-semibold transition-colors ${
              t.label === tab
                ? "bg-navy-900 text-white"
                : "border border-line text-ink-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {t.label}
            <span
              className={`ml-2 tabular-nums ${
                t.label === tab ? "text-brand-100/70" : "text-ink-400"
              }`}
            >
              {countOf(t.grades)}
            </span>
          </button>
        ))}
      </div>

      {groupsOf(active.grades).map((g) => (
        <section key={g.grade} className="mt-12 first:mt-10">
          <div className="flex flex-wrap items-baseline gap-3 border-b-2 border-navy-900 pb-4">
            <h3 className="text-xl font-bold text-navy-900">{g.grade}</h3>
            <span className="data-line text-ink-400">{g.members.length}개사</span>
          </div>
          <p className="mt-4 text-base leading-relaxed text-ink-600">{g.desc}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.members.map((m) => (
              <li key={`${m.name}-${m.site}`}>
                <a
                  href={`https://${m.site}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group block h-full rounded-lg border border-line bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-[0_10px_20px_-14px_rgba(6,42,85,0.45)]"
                >
                  <span className="block text-md font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                    {m.name}
                  </span>
                  <span className="label-mono mt-1.5 block truncate text-ink-400">
                    {m.site}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
