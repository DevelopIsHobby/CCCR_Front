import "server-only";
import { ready } from "./migrate";

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
  "notice.approved": "사업공고 · 승인",
  "notice.rejected": "사업공고 · 반려",
  "room.received": "회의실 · 접수 확인",
  "room.confirmed": "회의실 · 확정",
  "room.cancelled": "회의실 · 취소",
  "proposal.received": "교육사업 제안 · 접수 확인",
  "proposal.done": "교육사업 제안 · 검토 완료",
  "promo.received": "홍보 신청 · 접수 확인",
  "promo.running": "홍보 신청 · 진행",
  "promo.done": "홍보 신청 · 완료",
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
    where.push("(ref LIKE ? OR to_email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
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

/** 요약 숫자. 실패가 쌓이고 있으면 사무국이 바로 알아채야 한다. */
export async function countMailByStatus() {
  const db = await ready();
  const rows = await db.all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM mail_log GROUP BY status",
  );

  const counts = { sent: 0, failed: 0, skipped: 0, total: 0 };
  for (const r of rows) {
    const n = Number(r.n);
    if (r.status in counts) counts[r.status as keyof typeof counts] = n;
    counts.total += n;
  }
  return counts;
}
