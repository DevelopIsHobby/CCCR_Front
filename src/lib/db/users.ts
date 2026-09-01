import "server-only";
import { ready } from "./migrate";

export type { UserRole, UserRow, UserStatus } from "@/lib/user-types";
export { USER_STATUS_LABEL } from "@/lib/user-types";

import type { UserRow, UserStatus } from "@/lib/user-types";

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
    where.push("(email LIKE ? OR name LIKE ? OR company LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = await db.all<RawUser>(
    `${SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
     ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, id DESC`,
    params,
  );
  return rows.map(toUser);
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
