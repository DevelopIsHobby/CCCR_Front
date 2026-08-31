/** 서버·클라이언트 양쪽에서 쓰는 표시용 포맷터. */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/** SQLite 의 'YYYY-MM-DD HH:MM:SS'(UTC) 를 표시용 날짜로 바꾼다. */
export function formatDate(sqliteDate: string): string {
  return sqliteDate.slice(0, 10).replace(/-/g, ".");
}

export function formatDateTime(sqliteDate: string): string {
  return `${formatDate(sqliteDate)} ${sqliteDate.slice(11, 16)}`;
}

/** 오늘 날짜를 'YYYY-MM-DD' 로. 상태 계산 기준일이다. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export type EventStatus = "접수중" | "예정" | "종료";

/*
  행사 상태는 날짜에서 계산한다. 관리자가 손으로 바꾸지 않아도
  지난 행사가 계속 "접수중"으로 남는 일이 없다.
*/
export function eventStatus(
  event: { startsOn: string | null; endsOn: string | null; applyBy: string | null },
  now: string = today(),
): EventStatus | null {
  const last = event.endsOn ?? event.startsOn;
  if (!last) return null;
  if (now > last) return "종료";
  if (event.applyBy && now <= event.applyBy) return "접수중";
  return "예정";
}

/** '2026-09-09' + '2026-09-11' → '2026.09.09 – 09.11' */
export function formatEventPeriod(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn) return "";
  const start = formatDate(startsOn);
  if (!endsOn || endsOn === startsOn) return start;

  /* 같은 해면 뒷부분만, 다르면 전체를 적는다. */
  const sameYear = startsOn.slice(0, 4) === endsOn.slice(0, 4);
  return `${start} – ${sameYear ? formatDate(endsOn).slice(5) : formatDate(endsOn)}`;
}
