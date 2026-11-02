"use client";

import { useState } from "react";
import CoursePoster from "./CoursePoster";
import SmartLink from "./SmartLink";
import { IconArrow } from "./Icons";
import { courseStatus, daysBetween, formatRange, type EduCourse } from "@/lib/edu-course";

/*
  메인 'CCCR 아카데미' — 대표 포스터 하나를 크게, 나머지는 옆 목록.

  KOSA 처럼 같은 크기 포스터 카드를 옆으로 넘기면 포스터가 작아지고 두 사이트가 같아 보인다.
  마감이 가장 가까운 과정을 크게 두고, 목록을 누르면 큰 자리가 그 과정으로 바뀐다.
  어떤 과정을 어떤 차례로 보일지는 서버가 정해 넘긴다(lib/edu-course.ts 의 homeCourses).
*/

/** 마감까지 남은 날을 사람 말로. 접수예정이면 접수가 열리는 날을 알린다 */
function dueText(c: EduCourse, today: string): { text: string; urgent: boolean } {
  if (courseStatus(c, today) === "접수예정") {
    return { text: `${formatRange(c.applyFrom, c.applyFrom)} 접수 시작`, urgent: false };
  }
  const left = daysBetween(today, c.applyUntil);
  if (left === 0) return { text: "오늘 마감", urgent: true };
  /* 마감 일주일 안은 주황으로 서두르게 한다 */
  return { text: `마감 D-${left}`, urgent: left <= 7 };
}

export default function EduShowcase({
  courses,
  today,
}: {
  courses: EduCourse[];
  /** 서버가 정한 '오늘'(한국 시각). 화면과 서버가 날짜를 다르게 세지 않게 받아 쓴다 */
  today: string;
}) {
  const [picked, setPicked] = useState(0);
  const main = courses[Math.min(picked, courses.length - 1)];
  const due = dueText(main, today);

  return (
    /*
      큰 칸과 목록을 반씩. 처음에는 큰 칸이 57% 를 차지해 포스터가 지나치게 크고, 목록 카드는
      작은 채로 위에만 몰려 오른쪽 아래가 비었다. 목록 카드가 큰 칸 높이를 나눠 갖게 한다.
    */
    <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* 대표 포스터 */}
      <article className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]">
        {main.href ? (
          <SmartLink href={main.href} className="block">
            <CoursePoster course={main} />
          </SmartLink>
        ) : (
          <CoursePoster course={main} />
        )}
        <div className="flex flex-wrap items-end justify-between gap-4 p-6 lg:p-7">
          <div className="min-w-0 flex-1">
            <p
              className={`inline-flex rounded px-2.5 py-1 text-xs font-bold ${
                due.urgent ? "bg-flame-500 text-white" : "bg-brand-50 text-brand-700"
              }`}
            >
              {main.audience} · {courseStatus(main, today)} · {due.text}
            </p>
            {/*
              포스터가 없으면 자동 포스터에 과정명·기간이 크게 들어가 있다. 아래에 또 적으면
              두 번 겹치므로 그때는 글자를 화면에서만 감춘다(화면 낭독기에는 남긴다).
            */}
            <div className={main.posterUrl ? "" : "sr-only"}>
              <h3 className="mt-3 text-lg font-bold leading-snug text-navy-900 lg:text-xl">{main.title}</h3>
              <p className="mt-1.5 text-base text-ink-600">
                교육 {formatRange(main.startsOn, main.endsOn)}
                {main.summary && <span className="text-ink-400"> · {main.summary}</span>}
              </p>
            </div>
            {!main.posterUrl && (
              <p className="mt-2 text-base text-ink-600">
                접수 {formatRange(main.applyFrom, main.applyUntil)} · 아카데미에서 신청합니다
              </p>
            )}
          </div>
          {main.href && (
            <SmartLink
              href={main.href}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-flame-500 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-navy-900"
            >
              신청하기
              <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
            </SmartLink>
          )}
        </div>
      </article>

      {/* 다른 과정 — 누르면 큰 자리가 바뀐다. 큰 칸 높이를 나눠 가져 아래가 비지 않는다 */}
      <div className="flex flex-col gap-3">
        {courses.map((c, i) => {
          const d = dueText(c, today);
          const on = c === main;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setPicked(i)}
              aria-pressed={on}
              className={`grid flex-1 grid-cols-[104px_minmax(0,1fr)] items-center gap-4 sm:gap-5 rounded-xl p-4 text-left transition-colors sm:grid-cols-[168px_minmax(0,1fr)] ${
                on ? "bg-white" : "bg-white/[0.06] hover:bg-white/[0.12]"
              }`}
            >
              <span className="overflow-hidden rounded-lg">
                <CoursePoster course={c} compact />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                  <span
                    className={`rounded px-1.5 py-0.5 text-2xs font-bold ${
                      on ? "bg-brand-50 text-brand-700" : "bg-white/10 text-brand-100"
                    }`}
                  >
                    {c.audience}
                  </span>
                  <span className={d.urgent ? "text-flame-500" : on ? "text-brand-600" : "text-brand-100/70"}>
                    {d.text}
                  </span>
                </span>
                <span
                  className={`mt-1.5 line-clamp-2 text-md font-bold leading-snug ${on ? "text-navy-900" : "text-white"}`}
                >
                  {c.title}
                </span>
                <span className={`mt-1 block truncate text-sm ${on ? "text-ink-400" : "text-brand-100/60"}`}>
                  교육 {formatRange(c.startsOn, c.endsOn)}
                  {c.summary && ` · ${c.summary}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
