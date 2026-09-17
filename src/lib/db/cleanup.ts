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

  /* ── 교육사업 제안 — 처리 완료 기준 ────────────── */
  const doneCut = daysAgo(RETENTION_DAYS.proposal);
  report.proposals = await count(
    "SELECT COUNT(*) AS n FROM education_proposals WHERE status = 'done' AND updated_at < ?",
    [doneCut],
  );
  await db.run("DELETE FROM education_proposals WHERE status = 'done' AND updated_at < ?", [
    doneCut,
  ]);

  /* ── 반려된 사업공고 수신신청 ──────────────────── */
  const rejectedCut = daysAgo(RETENTION_DAYS.noticeRejected);
  report.noticeRejected = await count(
    "SELECT COUNT(*) AS n FROM notice_subscribers WHERE status = 'rejected' AND updated_at < ?",
    [rejectedCut],
  );
  await db.run("DELETE FROM notice_subscribers WHERE status = 'rejected' AND updated_at < ?", [
    rejectedCut,
  ]);

  /*
    ── 해지한 뉴스레터·수신 중단한 사업공고 — 해지·중단일부터 ──
    방침은 '해지·중단 시까지' 둔다고 적었는데 예전에는 상태만 바꾸고 기록을 계속 남겼다.
    해지·중단할 때 updated_at 을 남기므로(관리자 화면·마이페이지 모두) 그때부터 센다.
  */
  const unsubscribedCut = daysAgo(RETENTION_DAYS.unsubscribed);
  report.newsletterUnsubscribed = await count(
    "SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE status = 'unsubscribed' AND updated_at < ?",
    [unsubscribedCut],
  );
  await db.run("DELETE FROM newsletter_subscribers WHERE status = 'unsubscribed' AND updated_at < ?", [
    unsubscribedCut,
  ]);
  report.noticeUnsubscribed = await count(
    "SELECT COUNT(*) AS n FROM notice_subscribers WHERE status = 'unsubscribed' AND updated_at < ?",
    [unsubscribedCut],
  );
  await db.run("DELETE FROM notice_subscribers WHERE status = 'unsubscribed' AND updated_at < ?", [
    unsubscribedCut,
  ]);

  /*
    ── 승인되지 않은 가입 신청 · 이용이 제한된 계정 ──
    방침 제3조: 승인 대기는 신청일부터 6개월, 이용 제한은 제한한 날부터 1년.
    상태를 바꾼 때(status_changed_at)가 없으면 가입일부터 센다.
    관리자 계정은 어떤 경우에도 여기서 지우지 않는다.
  */
  const since = "COALESCE(NULLIF(status_changed_at, ''), created_at)";
  const pendingCut = daysAgo(RETENTION_DAYS.pendingMember);
  report.pendingMembers = await count(
    `SELECT COUNT(*) AS n FROM users WHERE role = 'member' AND status = 'pending' AND ${since} < ?`,
    [pendingCut],
  );
  await db.run(`DELETE FROM users WHERE role = 'member' AND status = 'pending' AND ${since} < ?`, [
    pendingCut,
  ]);

  const blockedCut = daysAgo(RETENTION_DAYS.blockedMember);
  report.blockedMembers = await count(
    `SELECT COUNT(*) AS n FROM users WHERE role = 'member' AND status = 'blocked' AND ${since} < ?`,
    [blockedCut],
  );
  await db.run(`DELETE FROM users WHERE role = 'member' AND status = 'blocked' AND ${since} < ?`, [
    blockedCut,
  ]);

  /* ── 관리자 접속 기록 — 2년 ────────────────────── */
  report.adminAccess = await count("SELECT COUNT(*) AS n FROM admin_access_log WHERE created_at < ?", [
    daysAgo(RETENTION_DAYS.adminAccess),
  ]);
  await db.run("DELETE FROM admin_access_log WHERE created_at < ?", [
    daysAgo(RETENTION_DAYS.adminAccess),
  ]);

  /* ── 기한(30분)이 지난 소셜 가입 대기 기록 ───────── */
  report.oauthSignups = await count("SELECT COUNT(*) AS n FROM oauth_signups WHERE expires_at < ?", [
    nowStamp,
  ]);
  await db.run("DELETE FROM oauth_signups WHERE expires_at < ?", [nowStamp]);

  /* 휴지통에서 30일이 지난 것을 진짜로 지운다 */
  report.trash = await purgeExpired();

  return report;
}
