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
