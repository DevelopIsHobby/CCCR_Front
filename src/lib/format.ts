/** 서버·클라이언트 양쪽에서 쓰는 표시용 포맷터. */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/*
  시각은 DB 에 UTC 로 쌓는다(driver.ts 의 now()). 화면과 '오늘'은 한국 시간으로 본다.
  예전에는 UTC 문자열을 그대로 잘라 보여 줘서 모든 시각이 9시간 이르게 찍혔고,
  한국 새벽 0~9시에 올린 글은 전날 날짜로 보였다. 서버 시간대 설정과 상관없이 맞도록
  계산으로 바꾼다. 한국은 서머타임이 없어 +9시간을 고정으로 더한다.
*/
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 이 순간(밀리초)의 한국 날짜 'YYYY-MM-DD'. 테스트에서 시각을 넘겨 확인한다. */
export function kstDate(ms: number): string {
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * DB 의 UTC 시각 'YYYY-MM-DD HH:MM:SS' 를 같은 모양의 한국 시각으로.
 * 행사 날짜처럼 날짜만 있는 값('YYYY-MM-DD')은 이미 한국 날짜이므로 그대로 둔다.
 */
export function toKst(dbTime: string): string {
  if (dbTime.length < 19) return dbTime;
  const ms = Date.parse(`${dbTime.slice(0, 19).replace(" ", "T")}Z`);
  if (Number.isNaN(ms)) return dbTime;
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 19).replace("T", " ");
}

/** DB 시각(UTC)이나 날짜를 화면용 한국 날짜 '2026.09.03' 으로. */
export function formatDate(value: string): string {
  return toKst(value).slice(0, 10).replace(/-/g, ".");
}

/** DB 시각(UTC)을 화면용 한국 시각 '2026.09.03 14:15' 로. */
export function formatDateTime(value: string): string {
  const kst = toKst(value);
  return `${kst.slice(0, 10).replace(/-/g, ".")} ${kst.slice(11, 16)}`;
}

/** 한국 기준 오늘 날짜 'YYYY-MM-DD'. 행사 상태·팝업 기간·방문 통계의 기준일이다. */
export function today(): string {
  return kstDate(Date.now());
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
