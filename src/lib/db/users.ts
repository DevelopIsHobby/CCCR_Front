import "server-only";
import { ready } from "./migrate";
import { likeContains } from "@/lib/like";

export type { UserRole, UserRow, UserStatus } from "@/lib/user-types";
export { USER_STATUS_LABEL } from "@/lib/user-types";

import type { UserRow, UserStatus } from "@/lib/user-types";
import type { SocialProvider } from "@/lib/auth/social-profile";

type RawUser = {
  id: number;
  email: string;
  name: string;
  company: string | null;
  department: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const toUser = (r: RawUser): UserRow => ({
  id: r.id,
  email: r.email,
  name: r.name,
  company: r.company,
  department: r.department,
  phone: r.phone,
  role: r.role === "admin" ? "admin" : "member",
  status: (["pending", "active", "blocked"].includes(r.status) ? r.status : "pending") as UserStatus,
  createdAt: r.created_at,
});

const SELECT = `SELECT id, email, name, company, department, phone, role, status, created_at
                FROM users`;

/** 관리자 화면 목록. 승인 대기를 먼저 보여준다. */
export async function listUsers(opts: { q?: string; status?: UserStatus | "all" } = {}) {
  const db = await ready();
  const q = opts.q?.trim() ?? "";
  const status = opts.status ?? "all";

  const where: string[] = [];
  const params: (string | number)[] = [];

  if (status !== "all") {
    where.push("status = ?");
    params.push(status);
  }
  if (q) {
    /* LOWER + likeContains 짝. 한쪽만 낮추면 아무것도 안 걸린다(lib/like.ts) */
    where.push("(LOWER(email) LIKE ? ESCAPE '\\' OR LOWER(name) LIKE ? ESCAPE '\\' OR LOWER(company) LIKE ? ESCAPE '\\')");
    const like = likeContains(q);
    params.push(like, like, like);
  }

  const rows = await db.all<RawUser>(
    `${SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
     ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, id DESC`,
    params,
  );
  const users = rows.map(toUser);
  if (users.length === 0) return users;

  /* 어느 소셜 계정으로 들어오는지. 승인할 때 참고한다. */
  const identities = await db.all<{ user_id: number; provider: string }>(
    `SELECT user_id, provider FROM user_identities WHERE user_id IN (${users.map(() => "?").join(", ")})`,
    users.map((u) => u.id),
  );
  const byUser = new Map<number, SocialProvider[]>();
  for (const row of identities) {
    const list = byUser.get(Number(row.user_id)) ?? [];
    list.push(row.provider as SocialProvider);
    byUser.set(Number(row.user_id), list);
  }
  return users.map((u) => ({ ...u, providers: byUser.get(u.id) ?? [] }));
}

/** 상태별 인원수. 관리자 화면 요약에 쓴다. */
export async function countUsersByStatus(): Promise<Record<UserStatus | "total", number>> {
  const db = await ready();
  const rows = await db.all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM users GROUP BY status",
  );

  const counts = { pending: 0, active: 0, blocked: 0, total: 0 };
  for (const row of rows) {
    const n = Number(row.n);
    if (row.status in counts) counts[row.status as UserStatus] = n;
    counts.total += n;
  }
  return counts;
}
