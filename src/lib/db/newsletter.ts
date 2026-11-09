import "server-only";
import { ready } from "./migrate";
import { likeContains } from "@/lib/like";
import { now } from "./driver";

export type SubscriberStatus = "active" | "unsubscribed";

export type Subscriber = {
  id: number;
  email: string;
  status: SubscriberStatus;
  source: string;
  createdAt: string;
};

type RawSubscriber = {
  id: number;
  email: string;
  status: string;
  source: string;
  created_at: string;
};

const toSubscriber = (r: RawSubscriber): Subscriber => ({
  id: r.id,
  email: r.email,
  status: r.status === "unsubscribed" ? "unsubscribed" : "active",
  source: r.source,
  createdAt: r.created_at,
});

export async function listSubscribers(
  opts: { q?: string; status?: SubscriberStatus | "all" } = {},
): Promise<Subscriber[]> {
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
    /* LOWER + likeContains 짝. 한쪽만 낮추면 아무것도 안 걸린다(lib/like.ts) */
    where.push("LOWER(email) LIKE ? ESCAPE '\\'");
    params.push(likeContains(q));
  }

  const rows = await db.all<RawSubscriber>(
    `SELECT id, email, status, source, created_at FROM newsletter_subscribers
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY id DESC`,
    params,
  );
  return rows.map(toSubscriber);
}

/*
  새 구독 알림. 관리자가 구독자 화면을 마지막으로 연 뒤에 들어온 신청 수를 사이드바·대시보드에 띄운다.
  전에는 구독 신청이 들어와도 관리자 화면 어디에도 표시가 없었다(2026-11-09 사무국).
  마지막으로 본 때는 site_settings 에 둔다(처음 값은 047 마이그레이션이 그때로 넣는다).
*/
export const NEWSLETTER_SEEN_KEY = "newsletter_seen_at";

export async function countNewSubscribers(): Promise<number> {
  const db = await ready();
  const row = await db.get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM newsletter_subscribers
      WHERE status = 'active'
        AND created_at > COALESCE((SELECT value FROM site_settings WHERE key = ?), '')`,
    [NEWSLETTER_SEEN_KEY],
  );
  return Number(row?.n ?? 0);
}

/** 구독자 화면을 열면 지금까지 들어온 신청을 본 것으로 한다 */
export async function markSubscribersSeen(): Promise<void> {
  const db = await ready();
  const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  await db.run(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [NEWSLETTER_SEEN_KEY, stamp, stamp],
  );
}

export async function countSubscribers(): Promise<{ active: number; unsubscribed: number }> {
  const db = await ready();
  const rows = await db.all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM newsletter_subscribers GROUP BY status",
  );

  const counts = { active: 0, unsubscribed: 0 };
  for (const row of rows) {
    if (row.status === "unsubscribed") counts.unsubscribed = Number(row.n);
    else counts.active = Number(row.n);
  }
  return counts;
}

/*
  회원가입에서 수신 동의를 함께 받은 경우 명단에 넣는다.

  "use server" 파일(newsletter-actions.ts)에 두면 이 함수까지 바깥에서 부를 수 있는
  서버 액션이 되어, 아무나 남의 이메일을 명단에 올릴 수 있다. 가입 절차에서만 쓰도록
  server-only 인 이 파일에 둔다(post-delete.ts 와 같은 이유).
*/
export async function addSubscriberFromSignup(email: string): Promise<void> {
  const db = await ready();
  const stamp = now();
  const existing = await db.get<{ id: number }>(
    "SELECT id FROM newsletter_subscribers WHERE email = ?",
    [email],
  );
  if (existing) return;

  await db.run(
    `INSERT INTO newsletter_subscribers (email, status, source, created_at, updated_at)
     VALUES (?, 'active', '회원가입', ?, ?)`,
    [email, stamp, stamp],
  );
}
