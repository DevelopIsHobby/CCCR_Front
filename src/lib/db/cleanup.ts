import "server-only";
import { ready } from "./migrate";
import type { SqlValue } from "./driver";
import { RETENTION_DAYS } from "@/lib/retention";
import { deleteUpload } from "@/lib/uploads";

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

  /* ── 회의실 예약 — 이용일 기준 ─────────────────── */
  const roomCut = dateDaysAgo(RETENTION_DAYS.room);
  report.roomReservations = await count(
    "SELECT COUNT(*) AS n FROM room_reservations WHERE use_date < ?",
    [roomCut],
  );
  await db.run("DELETE FROM room_reservations WHERE use_date < ?", [roomCut]);
  await db.run("DELETE FROM room_blocks WHERE use_date < ?", [roomCut]);

  /* ── 교육사업 제안 — 처리 완료 기준 ────────────── */
  const doneCut = daysAgo(RETENTION_DAYS.proposal);
  report.proposals = await count(
    "SELECT COUNT(*) AS n FROM education_proposals WHERE status = 'done' AND updated_at < ?",
    [doneCut],
  );
  await db.run("DELETE FROM education_proposals WHERE status = 'done' AND updated_at < ?", [
    doneCut,
  ]);

  /* ── 홍보 신청 — 올린 파일까지 함께 지운다 ─────── */
  const promoCut = daysAgo(RETENTION_DAYS.promo);
  const promos = await db.all<{ id: number; image_id: number | null; file_stored: string }>(
    "SELECT id, image_id, file_stored FROM promo_requests WHERE status = 'done' AND updated_at < ?",
    [promoCut],
  );
  for (const promo of promos) {
    await db.run("DELETE FROM promo_requests WHERE id = ?", [promo.id]);

    if (promo.image_id) {
      const image = await db.get<{ stored_name: string }>(
        "SELECT stored_name FROM images WHERE id = ?",
        [promo.image_id],
      );
      if (image) {
        await db.run("DELETE FROM images WHERE id = ?", [promo.image_id]);
        await deleteUpload(image.stored_name);
      }
    }
    if (promo.file_stored) await deleteUpload(promo.file_stored);
  }
  report.promos = promos.length;

  /* ── 반려된 사업공고 수신신청 ──────────────────── */
  const rejectedCut = daysAgo(RETENTION_DAYS.noticeRejected);
  report.noticeRejected = await count(
    "SELECT COUNT(*) AS n FROM notice_subscribers WHERE status = 'rejected' AND updated_at < ?",
    [rejectedCut],
  );
  await db.run("DELETE FROM notice_subscribers WHERE status = 'rejected' AND updated_at < ?", [
    rejectedCut,
  ]);

  return report;
}
