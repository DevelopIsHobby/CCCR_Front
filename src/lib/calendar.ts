/*
  메인 '일정 달력' 계산.

  날짜는 모두 'YYYY-MM-DD', 달은 'YYYY-MM' 글자로 다룬다. 글자 비교가 곧 날짜 비교이고,
  Date 를 쓸 때는 UTC 자정으로 읽어 시간대·서머타임 때문에 하루가 밀리지 않게 한다.
*/
/** '조합 일정'은 게시글 없이 관리자 화면(달력 일정)에서 직접 넣는 일정이다 */
export type CalendarKind = "행사" | "교육" | "공고 마감" | "조합 일정";

export const CALENDAR_KINDS: CalendarKind[] = ["행사", "교육", "공고 마감", "조합 일정"];

export function isCalendarKind(value: string): value is CalendarKind {
  return (CALENDAR_KINDS as string[]).includes(value);
}

export type CalendarEntry = {
  key: string;
  kind: CalendarKind;
  title: string;
  href: string;
  /** 시작일. 공고 마감은 마감일 하루라 start = end */
  start: string;
  end: string;
};

const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** 'YYYY-MM' 에 n 달을 더한다 */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

/**
 * 달력 칸. 일요일부터 한 주 7칸, 그 달 날짜만 채우고 앞뒤 빈칸은 null.
 * 줄 수는 그 달에 필요한 만큼(4~6줄).
 */
export function monthGrid(month: string): (string | null)[] {
  const first = utc(`${month}-01`);
  const lead = new Date(first).getUTCDay();
  const days = Math.round((utc(`${addMonths(month, 1)}-01`) - first) / 86_400_000);
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let i = 0; i < days; i++) cells.push(iso(first + i * 86_400_000));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** 그날 걸친 일정. 여러 날 이어지는 행사·교육은 기간 안의 모든 날에 걸친다 */
export function entriesOn(entries: CalendarEntry[], date: string): CalendarEntry[] {
  return entries.filter((e) => e.start <= date && date <= e.end);
}

/**
 * 관리자 설정을 건다. 하나씩 숨긴 일정(hidden: 항목 이름)과 꺼 둔 종류(off)를 뺀다.
 */
export function applyCalendarSettings(
  entries: CalendarEntry[],
  hidden: ReadonlySet<string>,
  off: ReadonlySet<CalendarKind>,
): CalendarEntry[] {
  return entries.filter((e) => !hidden.has(e.key) && !off.has(e.kind));
}

/**
 * 처음 골라 둘 날. 오늘 일정이 있으면 오늘, 없으면 오늘 뒤 가장 가까운 일정의 첫날,
 * 그것도 없으면 오늘.
 */
export function firstPick(entries: CalendarEntry[], today: string): string {
  if (entriesOn(entries, today).length > 0) return today;
  const next = entries
    .map((e) => e.start)
    .filter((d) => d > today)
    .sort()[0];
  return next ?? today;
}
