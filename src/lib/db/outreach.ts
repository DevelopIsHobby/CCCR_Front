import "server-only";
import { ready } from "./migrate";
import type {
  EducationProposal,
  NoticeSubscriber,
  ProposalStatus,
  SubscribeStatus,
} from "@/lib/outreach-types";

/* ── 사업공고 수신자 ──────────────────────────────── */

type RawNotice = {
  id: number;
  company: string;
  name: string;
  email: string;
  tel: string;
  status: string;
  note: string;
  created_at: string;
};

const SUBSCRIBE_STATUSES = new Set(["pending", "active", "rejected", "unsubscribed"]);

const toNotice = (r: RawNotice): NoticeSubscriber => ({
  id: Number(r.id),
  company: r.company,
  name: r.name,
  email: r.email,
  tel: r.tel,
  status: (SUBSCRIBE_STATUSES.has(r.status) ? r.status : "pending") as SubscribeStatus,
  note: r.note,
  createdAt: r.created_at,
});

export async function listNoticeSubscribers(
  opts: { q?: string; status?: SubscribeStatus | "all" } = {},
): Promise<NoticeSubscriber[]> {
  const db = await ready();
  const q = opts.q?.trim() ?? "";
  const status = opts.status ?? "all";

  const where: string[] = [];
  const params: string[] = [];

  if (status !== "all") {
    where.push("status = ?");
    params.push(status);
  }
  if (q) {
    where.push("(email LIKE ? OR company LIKE ? OR name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = await db.all<RawNotice>(
    `SELECT id, company, name, email, tel, status, note, created_at FROM notice_subscribers
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY id DESC`,
    params,
  );
  return rows.map(toNotice);
}

export type NoticeCounts = Record<SubscribeStatus, number>;

export async function countNoticeSubscribers(): Promise<NoticeCounts> {
  const db = await ready();
  const rows = await db.all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM notice_subscribers GROUP BY status",
  );

  const counts: NoticeCounts = { pending: 0, active: 0, rejected: 0, unsubscribed: 0 };
  for (const row of rows) {
    if (SUBSCRIBE_STATUSES.has(row.status)) counts[row.status as SubscribeStatus] = Number(row.n);
  }
  return counts;
}

/** 사이드바 배지 — 승인을 기다리는 신청 수 */
export async function countPendingNotices(): Promise<number> {
  const db = await ready();
  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM notice_subscribers WHERE status = 'pending'",
  );
  return Number(row?.n ?? 0);
}

/* ── 교육사업 제안 ────────────────────────────────── */

type RawProposal = {
  id: number;
  org: string;
  name: string;
  email: string;
  tel: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
};

const PROPOSAL_STATUSES = new Set(["new", "reading", "done"]);

const toProposal = (r: RawProposal): EducationProposal => ({
  id: Number(r.id),
  org: r.org,
  name: r.name,
  email: r.email,
  tel: r.tel,
  subject: r.subject,
  body: r.body,
  status: (PROPOSAL_STATUSES.has(r.status) ? r.status : "new") as ProposalStatus,
  createdAt: r.created_at,
});

export async function listProposals(
  opts: { status?: ProposalStatus | "all" } = {},
): Promise<EducationProposal[]> {
  const db = await ready();
  const status = opts.status ?? "all";

  const rows = await db.all<RawProposal>(
    `SELECT id, org, name, email, tel, subject, body, status, created_at
       FROM education_proposals
      ${status === "all" ? "" : "WHERE status = ?"}
      ORDER BY id DESC`,
    status === "all" ? [] : [status],
  );
  return rows.map(toProposal);
}

/** 대시보드와 사이드바 배지에 쓴다. */
export async function countNewProposals(): Promise<number> {
  const db = await ready();
  const row = await db.get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM education_proposals WHERE status = 'new'",
  );
  return Number(row?.n ?? 0);
}
