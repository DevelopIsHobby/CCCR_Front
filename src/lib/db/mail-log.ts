import "server-only";
import { ready } from "./migrate";
import { likeContains } from "@/lib/like";

/*
  보낸 알림 메일 기록.

  "메일이 안 왔다"는 문의가 들어왔을 때 사무국이 스스로 확인할 수 있어야 한다.
  보냈는지(sent) · 실패했는지(failed) · 설정이 없어 건너뛰었는지(skipped)를 남긴다.
  본문은 남기지 않는다. 남길 이유가 없고, 남기면 개인정보만 늘어난다.
*/

export type MailLogRow = {
  id: number;
  kind: string;
  ref: string;
  toEmail: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  error: string;
  createdAt: string;
};

export const MAIL_PER_PAGE = 30;

/** 무슨 알림인지 한글로. 목록에서 kind 를 그대로 보여 주면 읽기 어렵다. */
export const MAIL_KIND_LABEL: Record<string, string> = {
  "notice.received": "사업공고 · 접수 확인",
  /* 신청자가 아니라 사무국이 받는 알림. 빠져 있어 코드값이 그대로 보였다. */
  "notice.office": "사업공고 · 사무국 알림",
  "notice.approved": "사업공고 · 승인",
  "notice.rejected": "사업공고 · 반려",
  "proposal.received": "교육사업 제안 · 접수 확인",
  "proposal.office": "교육사업 제안 · 사무국 알림",
  "proposal.done": "교육사업 제안 · 검토 완료",
  "account.reset": "비밀번호 재설정",
  "member.office": "회원가입 · 사무국 알림",
  "member.approved": "회원가입 · 승인",
};

export const MAIL_STATUS_LABEL: Record<MailLogRow["status"], string> = {
  sent: "발송됨",
  failed: "실패",
  skipped: "건너뜀",
};

type Raw = {
  id: number;
  kind: string;
  ref: string;
  to_email: string;
  subject: string;
  status: string;
  error: string;
  created_at: string;
};

const toRow = (r: Raw): MailLogRow => ({
  id: Number(r.id),
  kind: r.kind,
  ref: r.ref,
  toEmail: r.to_email,
  subject: r.subject,
  status: r.status as MailLogRow["status"],
  error: r.error,
  createdAt: r.created_at,
});

export async function listMailLog(opts: { q?: string; page?: number } = {}) {
  const db = await ready();
  const q = opts.q?.trim() ?? "";
  const page = Math.max(1, opts.page ?? 1);

  const where: string[] = [];
  const params: string[] = [];
  if (q) {
    /* 접수번호·받는 주소 어느 쪽으로도 찾을 수 있게 한다 */
    /* LOWER + likeContains 짝. 한쪽만 낮추면 아무것도 안 걸린다(lib/like.ts) */
    where.push("(LOWER(ref) LIKE ? ESCAPE '\\' OR LOWER(to_email) LIKE ? ESCAPE '\\')");
    const like = likeContains(q);
    params.push(like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = Number(
    (await db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM mail_log ${clause}`, params))?.n ?? 0,
  );
  const totalPages = Math.max(1, Math.ceil(total / MAIL_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const rows = await db.all<Raw>(
    `SELECT id, kind, ref, to_email, subject, status, error, created_at
       FROM mail_log ${clause}
      ORDER BY id DESC
      LIMIT ${MAIL_PER_PAGE} OFFSET ${(safePage - 1) * MAIL_PER_PAGE}`,
    params,
  );

  return { rows: rows.map(toRow), total, page: safePage, totalPages };
}

/** 이 기간 안의 실패만 경고한다 */
export const MAIL_FAIL_ALERT_DAYS = 7;

/** 요약 숫자. 실패가 쌓이고 있으면 사무국이 바로 알아채야 한다. */
export async function countMailByStatus() {
  const db = await ready();
  /* created_at 은 'YYYY-MM-DD HH:MM:SS' 로 쌓인다(cleanup.ts 와 같은 비교) */
  const since = new Date(Date.now() - MAIL_FAIL_ALERT_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const [rows, recent] = await Promise.all([
    db.all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM mail_log GROUP BY status"),
    /*
      경고는 최근 실패만 센다. 오래전 실패(메일 설정을 맞추던 때의 시험 메일 등)까지 세면
      이미 해결된 일로 빨간 경고가 계속 떠서 정작 새 실패를 알아채기 어렵다.
    */
    db.get<{ n: number }>("SELECT COUNT(*) AS n FROM mail_log WHERE status = 'failed' AND created_at >= ?", [
      since,
    ]),
  ]);

  const counts = { sent: 0, failed: 0, skipped: 0, total: 0, recentFailed: Number(recent?.n ?? 0) };
  for (const r of rows) {
    const n = Number(r.n);
    if (r.status === "sent" || r.status === "failed" || r.status === "skipped") counts[r.status] = n;
    counts.total += n;
  }
  return counts;
}
