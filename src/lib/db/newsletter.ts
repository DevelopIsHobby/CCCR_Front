import "server-only";
import { ready } from "./migrate";

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
    where.push("email LIKE ?");
    params.push(`%${q}%`);
  }

  const rows = await db.all<RawSubscriber>(
    `SELECT id, email, status, source, created_at FROM newsletter_subscribers
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY id DESC`,
    params,
  );
  return rows.map(toSubscriber);
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
