import "server-only";
import { headers } from "next/headers";
import { ready } from "./migrate";
import { now } from "./driver";

/*
  관리자 접속 기록.

  「개인정보의 안전성 확보조치 기준」 제8조: 개인정보를 다루는 사람(여기서는 관리자)이
  개인정보처리시스템에 접속한 기록을 1년 이상 보관하고, 월 1회 이상 점검해야 한다.
  기록에는 누가(계정)·언제·어디서(IP)·무엇을(수행 업무) 했는지가 들어가야 한다.

  남기는 곳
    - 조회     : 관리자 화면을 열 때 (AdminAccessLogger → recordAdminView)
    - 처리     : 관리자 서버 액션을 부를 때 (requireAdmin 안에서)
    - 내려받기 : 명단 내려받기(CSV)
    - 점검     : 월간 점검을 마쳤다고 표시할 때

  기록이 실패해도 관리 업무는 막지 않는다. DB 가 잠깐 바빠서 승인 단추가 안 눌리면 곤란하다.
  보관 기간은 retention.ts(adminAccess), 파기는 cleanup.ts.
*/

export type AdminAction = "조회" | "처리" | "내려받기" | "점검";

export const ADMIN_ACTIONS: AdminAction[] = ["조회", "처리", "내려받기", "점검"];

type Who = { userId: number; email: string };

export type AdminAccessRow = {
  id: number;
  email: string;
  ip: string;
  action: string;
  target: string;
  createdAt: string;
};

/**
  접속한 곳의 IP.
  방문 통계와 달리 원문을 남긴다. 누가 어디서 개인정보에 접근했는지가 이 기록의 목적이다(방침 제2조).
  Nginx 가 직접 적는 X-Real-IP 를 먼저 믿는다(rate-limit.ts 와 같은 이유).
*/
async function clientIp(): Promise<string> {
  try {
    const head = await headers();
    const forwarded = head.get("x-forwarded-for") ?? "";
    return (head.get("x-real-ip")?.trim() || forwarded.split(",")[0].trim() || "").slice(0, 60);
  } catch {
    return "";
  }
}

export async function logAdminAccess(who: Who, action: AdminAction, target: string): Promise<void> {
  try {
    const db = await ready();
    await db.run(
      `INSERT INTO admin_access_log (user_id, email, ip, action, target, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [who.userId, who.email, await clientIp(), action, target.slice(0, 300), now()],
    );
  } catch {
    /* 기록 때문에 관리 업무가 막히면 안 된다 */
  }
}

/**
  서버 액션 안에서 불렸으면 '처리'로 남긴다. 화면을 그리는 중에 불린 것은 남기지 않는다
  (그건 AdminAccessLogger 가 '조회'로 남긴다).
  어느 화면에서 한 일인지는 요청을 보낸 화면 주소(Referer)로 적는다.
*/
export async function logAdminActionIfAny(who: Who, label?: string): Promise<void> {
  let head: Headers;
  try {
    head = await headers();
  } catch {
    return;
  }
  if (!head.get("next-action")) return;

  let from = "";
  try {
    const ref = head.get("referer");
    if (ref) {
      const url = new URL(ref);
      from = `${url.pathname}${url.search}`;
    }
  } catch {
    /* 주소를 못 읽으면 화면 없이 남긴다 */
  }

  const what = label ?? "관리 작업";
  await logAdminAccess(who, "처리", from ? `${what} · ${from}` : what);
}

/** 한국 시각 'YYYY-MM' 달의 시작·끝을 DB 에 담긴 UTC 문자열로. */
function monthRangeUtc(month: string): [string, string] | null {
  const m = month.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  /* 한국은 UTC+9 — 한국 달의 첫 순간은 UTC 로 9시간 앞이다 */
  const start = new Date(Date.UTC(y, mo - 1, 1) - 9 * 3_600_000);
  const end = new Date(Date.UTC(y, mo, 1) - 9 * 3_600_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
  return [fmt(start), fmt(end)];
}

export const ADMIN_ACCESS_PER_PAGE = 50;

export async function listAdminAccess(opts: { month?: string; action?: string; page?: number } = {}) {
  const db = await ready();
  const where: string[] = [];
  const params: string[] = [];

  const range = opts.month ? monthRangeUtc(opts.month) : null;
  if (range) {
    where.push("created_at >= ? AND created_at < ?");
    params.push(range[0], range[1]);
  }
  if (opts.action && (ADMIN_ACTIONS as string[]).includes(opts.action)) {
    where.push("action = ?");
    params.push(opts.action);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = Number(
    (await db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM admin_access_log ${clause}`, params))?.n ?? 0,
  );
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_ACCESS_PER_PAGE));
  const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);

  const rows = await db.all<{
    id: number;
    email: string;
    ip: string;
    action: string;
    target: string;
    created_at: string;
  }>(
    `SELECT id, email, ip, action, target, created_at FROM admin_access_log ${clause}
      ORDER BY id DESC
      LIMIT ${ADMIN_ACCESS_PER_PAGE} OFFSET ${(page - 1) * ADMIN_ACCESS_PER_PAGE}`,
    params,
  );

  return {
    rows: rows.map(
      (r): AdminAccessRow => ({
        id: Number(r.id),
        email: r.email,
        ip: r.ip,
        action: r.action,
        target: r.target,
        createdAt: r.created_at,
      }),
    ),
    total,
    page,
    totalPages,
  };
}

/** 가장 최근 월간 점검. 없으면 null. */
export async function lastInspection(): Promise<AdminAccessRow | null> {
  const db = await ready();
  const r = await db.get<{
    id: number;
    email: string;
    ip: string;
    action: string;
    target: string;
    created_at: string;
  }>(
    "SELECT id, email, ip, action, target, created_at FROM admin_access_log WHERE action = '점검' ORDER BY id DESC LIMIT 1",
  );
  if (!r) return null;
  return {
    id: Number(r.id),
    email: r.email,
    ip: r.ip,
    action: r.action,
    target: r.target,
    createdAt: r.created_at,
  };
}

/** 점검한 지 이만큼 지나면 사이드바·화면에서 알린다. 기준은 '월 1회 이상'. */
export const INSPECTION_DUE_DAYS = 31;

export function inspectionOverdue(last: AdminAccessRow | null): boolean {
  if (!last) return true;
  const at = new Date(`${last.createdAt.replace(" ", "T")}Z`).getTime();
  return Date.now() - at > INSPECTION_DUE_DAYS * 86_400_000;
}
