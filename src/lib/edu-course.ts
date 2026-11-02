/*
  CCCR 아카데미 교육 과정 — 상태 셈과 메인에 보일 차례.

  날짜는 모두 'YYYY-MM-DD' 글자다(한국 시각 기준, lib/format.ts 의 today()).
  글자끼리 크기를 견주면 날짜 차례와 같다.

  DB·서버 전용 코드를 부르지 않아 단위 시험에서 바로 불러 쓸 수 있다.
*/

/** 과정 구분. CCCR 아카데미는 재직자 교육과 미취업자 교육을 함께 연다(migrations/043) */
export type Audience = "재직자" | "미취업자";
export const AUDIENCES: Audience[] = ["재직자", "미취업자"];

export function isAudience(value: string): value is Audience {
  return (AUDIENCES as string[]).includes(value);
}

export type EduCourse = {
  id: number;
  title: string;
  audience: Audience;
  /** '집체 · 4일 · 32시간' 처럼 한 줄 요약 */
  summary: string;
  /** 신청 페이지(아카데미). 빈 값이면 누를 곳이 없다 */
  href: string;
  /** 포스터 그림(/api/images/N). 빈 값이면 화면이 과정명으로 포스터를 그린다 */
  posterUrl: string;
  applyFrom: string;
  applyUntil: string;
  startsOn: string;
  endsOn: string;
  isVisible: boolean;
};

export type CourseStatus = "접수예정" | "접수중" | "마감";

/** 접수 마감일 당일까지는 접수중이다(사업공고와 같은 기준) */
export function courseStatus(c: Pick<EduCourse, "applyFrom" | "applyUntil">, today: string): CourseStatus {
  if (today < c.applyFrom) return "접수예정";
  if (today <= c.applyUntil) return "접수중";
  return "마감";
}

/** 두 날짜 사이의 날 수. 'YYYY-MM-DD' 를 UTC 자정으로 읽어 서머타임 같은 어긋남이 없게 한다 */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/**
 * 메인에 보일 과정과 차례.
 * 접수중인 것을 마감이 가까운 순서로 먼저, 그다음 접수예정을 접수 시작이 가까운 순서로.
 * 마감된 과정은 메인에 두지 않는다(아카데미 전체 일정에서 본다).
 */
export function homeCourses(courses: EduCourse[], today: string, limit = 4): EduCourse[] {
  const visible = courses.filter((c) => c.isVisible);
  const open = visible
    .filter((c) => courseStatus(c, today) === "접수중")
    .sort((a, b) => a.applyUntil.localeCompare(b.applyUntil) || a.id - b.id);
  const soon = visible
    .filter((c) => courseStatus(c, today) === "접수예정")
    .sort((a, b) => a.applyFrom.localeCompare(b.applyFrom) || a.id - b.id);
  return [...open, ...soon].slice(0, limit);
}

/** 'YYYY-MM-DD' 두 개를 '11.16 ~ 11.19' 로. 해가 바뀌면 해를 붙인다 */
export function formatRange(from: string, to: string): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${from.replace(/-/g, ".")} ~ ${to.replace(/-/g, ".")}`;
  return from === to ? md(from) : `${md(from)} ~ ${md(to)}`;
}

/** 'YYYY-MM-DD' 인지. 2월 30일처럼 없는 날도 걸러낸다 */
export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
