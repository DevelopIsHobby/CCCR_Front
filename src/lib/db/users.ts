import "server-only";
import { ready } from "./migrate";
import { likeContains } from "@/lib/like";

export type { UserRole, UserRow, UserStatus } from "@/lib/user-types";
export { USER_STATUS_LABEL } from "@/lib/user-types";
import { isMemberType } from "@/lib/user-types";

import type { DuplicateField, DuplicateHint, UserRow, UserStatus } from "@/lib/user-types";
import type { SocialProvider } from "@/lib/auth/social-profile";

type RawUser = {
  id: number;
  email: string;
  name: string;
  company: string | null;
  department: string | null;
  phone: string | null;
  biz_number: string | null;
  member_type: string | null;
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
  bizNumber: r.biz_number,
  memberType: r.member_type && isMemberType(r.member_type) ? r.member_type : null,
  role: r.role === "admin" ? "admin" : "member",
  status: (["pending", "active", "blocked"].includes(r.status) ? r.status : "pending") as UserStatus,
  createdAt: r.created_at,
});

const SELECT = `SELECT id, email, name, company, department, phone, biz_number, member_type, role, status, created_at
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
  const dupes = await findDuplicates(users);
  return users.map((u) => ({
    ...u,
    providers: byUser.get(u.id) ?? [],
    dupes: dupes.get(u.id) ?? [],
  }));
}

/*
  같은 사람일 수 있는 계정 찾기.

  휴대전화번호가 같은 계정은 가입 때 막으므로(migrations/037) 여기까지 오지 않는다.
  남는 길은 번호를 바꿔 가며 또 만드는 것이라, 번호 말고 겹치는 것을 본다.

  막지는 않고 보여 주기만 한다. 같은 회사에 담당자가 둘인 것은 정당하고,
  동명이인도 있다. 사람이 보고 판단할 일이라 판단까지 대신하지 않는다.
*/
async function findDuplicates(users: UserRow[]): Promise<Map<number, DuplicateHint[]>> {
  const found = new Map<number, DuplicateHint[]>();

  /* 승인 대기만 본다. 이미 승인한 계정 옆에 띄워 봐야 할 일이 없다. */
  const pending = users.filter((u) => u.status === "pending");
  if (pending.length === 0) return found;

  const db = await ready();
  const add = (id: number, hint: DuplicateHint) => {
    const list = found.get(id) ?? [];
    /*
      같은 계정이 이름으로도 사업자번호로도 걸리면 줄을 둘로 늘리지 않고
      겹치는 항목만 합친다. 둘 다 겹친다는 것이 곧 더 강한 근거다.
    */
    const already = list.find((h) => h.id === hint.id);
    if (already) {
      for (const f of hint.fields) if (!already.fields.includes(f)) already.fields.push(f);
    } else {
      list.push(hint);
    }
    found.set(id, list);
  };

  for (const u of pending) {
    const keys: { field: DuplicateField; sql: string; value: string }[] = [
      { field: "name", sql: "LOWER(name) = LOWER(?)", value: u.name },
    ];
    if (u.bizNumber) {
      keys.push({ field: "bizNumber", sql: "biz_number = ?", value: u.bizNumber });
    }

    for (const k of keys) {
      const rows = await db.all<{
        id: number;
        email: string;
        name: string;
        company: string | null;
        status: string;
        created_at: string;
      }>(
        `SELECT id, email, name, company, status, created_at
         FROM users WHERE ${k.sql} AND id <> ?`,
        [k.value, u.id],
      );
      for (const r of rows) {
        add(u.id, {
          fields: [k.field],
          id: Number(r.id),
          email: r.email,
          name: r.name,
          company: r.company,
          status: (["pending", "active", "blocked"].includes(r.status)
            ? r.status
            : "pending") as UserStatus,
          createdAt: r.created_at,
        });
      }
    }
  }

  return found;
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
