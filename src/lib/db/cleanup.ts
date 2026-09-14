import "server-only";
import { ready } from "./migrate";
import type { SqlValue } from "./driver";
import { RETENTION_DAYS } from "@/lib/retention";
import { purgeExpired } from "./trash";

/*
  보관 기간이 지난 자료를 지운다.

  방침에 "1년", "3개월"이라고 적어 두고 실제로 지우지 않으면 적어 놓은 것을
  지키지 않는 셈이 된다. 하루 한 번 불러 준다(scripts/cleanup 또는 /api/cleanup).

  지운 개수를 돌려주므로 로그만 봐도 무엇이 얼마나 지워졌는지 알 수 있다.
*/

export type CleanupReport = Record<string, number>;

/** N일 전 시각. DB 에 담긴 'YYYY-MM-DD HH:MM:SS' 꼴로 돌려준다. */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19).replace("T", " ");
}

/** 날짜만 담긴 칸(use_date 등)과 견주기 위한 'YYYY-MM-DD'. */
function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

export async function runCleanup(): Promise<CleanupReport> {
  const db = await ready();
  const report: CleanupReport = {};

  const count = async (sql: string, params: SqlValue[] = []) => {
    const row = await db.get<{ n: number }>(sql, params);
    return Number(row?.n ?? 0);
  };

  /* ── 만료된 로그인 ─────────────────────────────── */
  const nowStamp = new Date().toISOString();
  report.sessions = await count("SELECT COUNT(*) AS n FROM sessions WHERE expires_at < ?", [
    nowStamp,
  ]);
  await db.run("DELETE FROM sessions WHERE expires_at < ?", [nowStamp]);

  /* ── 다 쓴 비밀번호 재설정 링크 ────────────────── */
  report.passwordResets = await count(
    "SELECT COUNT(*) AS n FROM password_resets WHERE expires_at < ? OR used_at <> ''",
    [nowStamp.slice(0, 19).replace("T", " ")],
  );
  await db.run("DELETE FROM password_resets WHERE expires_at < ? OR used_at <> ''", [
    nowStamp.slice(0, 19).replace("T", " "),
  ]);

  /* ── 횟수 제한 기록 ────────────────────────────── */
  report.rateEvents = await count("SELECT COUNT(*) AS n FROM rate_events WHERE created_at < ?", [
    daysAgo(RETENTION_DAYS.rateEvents),
  ]);
  await db.run("DELETE FROM rate_events WHERE created_at < ?", [
    daysAgo(RETENTION_DAYS.rateEvents),
  ]);

  /* ── 접속 기록 ─────────────────────────────────── */
  report.visits = await count("SELECT COUNT(*) AS n FROM visits WHERE day < ?", [
    dateDaysAgo(RETENTION_DAYS.visits),
  ]);
  await db.run("DELETE FROM visits WHERE day < ?", [dateDaysAgo(RETENTION_DAYS.visits)]);

  /* ── 메일 보낸 기록 ────────────────────────────── */
  report.mailLog = await count("SELECT COUNT(*) AS n FROM mail_log WHERE created_at < ?", [
    daysAgo(RETENTION_DAYS.mailLog),
  ]);
  await db.run("DELETE FROM mail_log WHERE created_at < ?", [daysAgo(RETENTION_DAYS.mailLog)]);

  /* 휴지통에서 30일이 지난 것을 진짜로 지운다 */
  report.trash = await purgeExpired();

  return report;
}
