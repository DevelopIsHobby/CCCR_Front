"use client";

import { useState } from "react";
import SmartLink from "./SmartLink";
import { IconChevron } from "./Icons";
import {
  addMonths,
  entriesOn,
  firstPick,
  monthGrid,
  type CalendarEntry,
  type CalendarKind,
} from "@/lib/calendar";

/*
  종류 색. 사이트 색(남색·파랑·주황) 안에서 고르면 교육(남색)과 공고 마감(파랑)이 작은 점에서
  구별되지 않았다. 셋이 색상부터 다르게 주황·초록(청록)·파랑으로 둔다.
*/
const KIND_DOT: Record<CalendarKind, string> = {
  행사: "bg-flame-500",
  교육: "bg-teal-600",
  "공고 마감": "bg-brand-500",
};
const KIND_TEXT: Record<CalendarKind, string> = {
  행사: "text-flame-600",
  교육: "text-teal-700",
  "공고 마감": "text-brand-600",
};
const KINDS: CalendarKind[] = ["행사", "교육", "공고 마감"];
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

const navButton =
  "grid size-8 place-items-center rounded-full text-white/80 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white";

/*
  메인 '일정 달력' — 조합 소식 오른쪽 칸.

  전에는 '지금 모집 중' 홍보 알림판 자리였다. 홍보 칸이 많다는 의견으로 뺐고, 그 자리를
  '다가오는 일정' 목록으로 채웠다가 달력이 낫다는 의견으로 바꿨다(2026-11-03).
  행사·교육은 기간 내내, 사업공고는 마감일에 색 점을 찍는다. 날을 누르면 아래에 그날 일정이 나온다.
  내용은 행사정보·사업공고 글과 아카데미 교육 과정에서 저절로 채워진다.

  모양: 회색 칸이 메인의 흰·남색 띠와 따로 놀아, 머리를 슬라이드·참여하기와 같은 남색 띠로 두고
  몸은 흰 카드로 바꿨다. 제목('일정 달력')은 화면에서 빼고 화면 낭독기에만 남긴다(NewsSection).
*/
export default function CalendarCard({
  entries,
  today,
}: {
  entries: CalendarEntry[];
  /** 서버가 정한 '오늘'(한국 시각). 화면과 서버가 날짜를 다르게 세지 않게 받아 쓴다 */
  today: string;
}) {
  const [picked, setPicked] = useState(() => firstPick(entries, today));
  const [month, setMonth] = useState(() => picked.slice(0, 7));

  const cells = monthGrid(month);
  const pickedEntries = entriesOn(entries, picked);
  const [y, m] = month.split("-").map(Number);
  const pickedLabel = `${Number(picked.slice(5, 7))}월 ${Number(picked.slice(8, 10))}일 ${
    WEEK[new Date(`${picked}T00:00:00Z`).getUTCDay()]
  }요일`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-26px_rgba(6,42,85,0.45)] ring-1 ring-line">
      {/* 머리: 메인 위·아래 띠와 같은 남색 */}
      <div className="relative flex items-center justify-between gap-3 bg-navy-900 px-5 py-4">
        <div className="hex-field absolute inset-0 opacity-60" aria-hidden />
        {/* 메인 슬라이드 아래와 같은 주황 띠 한 줄. 남색 머리와 흰 몸의 경계를 잡는다 */}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-flame-500" aria-hidden />
        <div className="relative">
          <p className="label-mono text-flame-500">SCHEDULE</p>
          <p className="mt-0.5 text-lg font-bold text-white" aria-live="polite">
            {y}년 {m}월
          </p>
        </div>
        <div className="relative flex gap-1.5">
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, -1))}
            aria-label="이전 달"
            className={navButton}
          >
            <IconChevron className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            aria-label="다음 달"
            className={navButton}
          >
            <IconChevron className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* 요일 + 날짜 */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEK.map((w, i) => (
            <span
              key={w}
              className={`pb-1.5 text-2xs font-semibold ${i === 0 ? "text-flame-500" : "text-ink-400"}`}
            >
              {w}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const on = entriesOn(entries, date);
            const kinds = KINDS.filter((k) => on.some((e) => e.kind === k));
            const isPicked = date === picked;
            const isToday = date === today;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setPicked(date)}
                aria-pressed={isPicked}
                aria-label={`${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일${
                  on.length ? `, 일정 ${on.length}건` : ""
                }${isToday ? ", 오늘" : ""}`}
                className={`mx-auto flex size-9 flex-col items-center justify-center rounded-full text-sm tabular-nums transition-colors ${
                  isPicked
                    ? "bg-navy-900 font-bold text-white shadow-[0_6px_14px_-6px_rgba(6,42,85,0.6)]"
                    : isToday
                      ? "bg-flame-100 font-bold text-flame-700"
                      : on.length
                        ? "font-semibold text-navy-900 hover:bg-brand-50"
                        : `${i % 7 === 0 ? "text-flame-500/70" : "text-ink-400"} hover:bg-surface`
                }`}
              >
                <span className="leading-none">{Number(date.slice(8, 10))}</span>
                {/* 일정 종류마다 점 하나 */}
                <span className="mt-1 flex h-1.5 gap-0.5" aria-hidden>
                  {kinds.map((k) => (
                    <span
                      key={k}
                      className={`size-1.5 rounded-full ${isPicked ? "bg-white" : KIND_DOT[k]}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* 점 색 안내 — 달력 바로 아래 */}
        <p className="mt-3 flex justify-center gap-4 text-2xs text-ink-400" aria-hidden>
          {KINDS.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${KIND_DOT[k]}`} />
              {k}
            </span>
          ))}
        </p>

        {/*
          고른 날의 일정. 색 칸·세로 막대를 얹었더니 지저분해 보여서, 가는 줄 아래에
          날짜 한 줄과 '색 점 · 종류 · 제목' 한 줄씩만 둔다.
        */}
        <div className="mt-4 flex-1 border-t border-line pt-4">
          <p className="text-xs font-bold text-navy-900">{pickedLabel}</p>
          {pickedEntries.length === 0 ? (
            <p className="mt-2 text-sm text-ink-400">일정이 없습니다.</p>
          ) : (
            <ul className="mt-2 space-y-1.5" aria-label="고른 날의 일정">
              {pickedEntries.slice(0, 3).map((e) => (
                <li key={e.key}>
                  <SmartLink href={e.href} className="group flex items-center gap-2 text-sm">
                    <span className={`size-1.5 shrink-0 rounded-full ${KIND_DOT[e.kind]}`} aria-hidden />
                    <span className={`shrink-0 text-xs font-semibold ${KIND_TEXT[e.kind]}`}>
                      {e.kind}
                    </span>
                    <span className="truncate text-ink-900 group-hover:text-brand-600">{e.title}</span>
                  </SmartLink>
                </li>
              ))}
              {/* 칸 높이를 지키려 세 건까지만 적고, 나머지는 수만 알린다 */}
              {pickedEntries.length > 3 && (
                <li className="pl-3.5 text-2xs text-ink-400">외 {pickedEntries.length - 3}건</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
