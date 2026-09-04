import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";

const COOKIE = "c3r_session";

/*
  로그인 유지 기간.

  예전에는 누구든 이레였다. 활동과 상관없는 절대 기간이라 집에서 로그인하고
  다음 날 회사에서 열어도 그대로 들어가졌다.

  관리자는 짧게 둔다. 회원 개인정보와 모든 글을 볼 수 있어, 공용 PC 에 열어 둔
  채 자리를 뜨면 그대로 남는 것이 위험하다.
  '로그인 유지'는 본인이 고른 개인 기기에만 쓴다. 관리자에게는 주지 않는다.
*/
const WINDOW_SEC = {
  admin: 60 * 60 * 8, //  8시간
  member: 60 * 60 * 24, // 24시간
  remember: 60 * 60 * 24 * 14, // 14일
} as const;

export type Session = {
  userId: number;
  name: string;
  email: string;
  role: "admin" | "member";
};

/* 쿠키에는 원문 토큰을, DB 에는 해시만 둔다. DB 가 새도 세션을 만들 수 없다. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number, remember = false): Promise<void> {
  const db = await ready();

  /* 권한에 따라 기간이 다르므로 여기서 확인한다. 관리자는 '유지'를 골라도 짧게 둔다. */
  const user = await db.get<{ role: string }>("SELECT role FROM users WHERE id = ?", [userId]);
  const maxAge =
    user?.role === "admin"
      ? WINDOW_SEC.admin
      : remember
        ? WINDOW_SEC.remember
        : WINDOW_SEC.member;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await db.run(
    `INSERT INTO sessions (token_hash, user_id, expires_at, max_age_sec, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [hashToken(token), userId, expiresAt.toISOString(), maxAge, now()],
  );

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    /*
      쿠키는 가장 긴 기간으로 넉넉히 둔다. 실제 만료는 sessions 표가 정하고
      쓰는 동안 늘어나는데, 쿠키가 먼저 죽으면 그 연장이 소용없어진다.
      쿠키가 남아 있어도 표에서 지나면 로그인은 풀린다.
    */
    maxAge: WINDOW_SEC.remember,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const db = await ready();
  const row = await db.get<{
    id: number;
    name: string;
    email: string;
    role: string;
    expires_at: string;
    max_age_sec: number;
  }>(
    `SELECT u.id, u.name, u.email, u.role, s.expires_at, s.max_age_sec
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
    [hashToken(token)],
  );

  if (!row) return null;

  const expiresAt = new Date(row.expires_at).getTime();
  if (expiresAt < Date.now()) {
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
    return null;
  }

  /*
    쓰는 동안에는 기간을 다시 채운다.

    절대 기간만 두면 한창 일하다가 갑자기 튕긴다. 그렇다고 요청마다 늘리면
    쓸데없이 DB 에 쓴다. 남은 시간이 절반 아래로 내려갔을 때만 채운다.
    안 쓰면 그대로 만료되므로 자리를 뜬 채 남아 있는 일이 없다.
  */
  const maxAge = Number(row.max_age_sec) || WINDOW_SEC.member;
  if (expiresAt - Date.now() < (maxAge * 1000) / 2) {
    /*
      쿠키는 건드리지 않는다. 화면을 그리는 중에 쿠키를 고치면 Next 가 막는다.
      그래서 쿠키는 넉넉히 두고(createSession) 실제 만료는 이 표가 정한다.
      쿠키가 남아 있어도 이 행이 지나면 로그인은 풀린다.
    */
    await db.run("UPDATE sessions SET expires_at = ? WHERE token_hash = ?", [
      new Date(Date.now() + maxAge * 1000).toISOString(),
      hashToken(token),
    ]);
  }

  return {
    userId: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "admin" ? "admin" : "member",
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const db = await ready();
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
  }
  store.delete(COOKIE);
}

/**
 * 로그인이 있어야 하는 동작 앞에서 호출한다.
 * 자기 자신만 고치는 동작(이름·비밀번호 변경 등)은 관리자일 필요가 없다.
 */
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("로그인이 필요합니다.");
  return session;
}

/** 관리자 전용 동작 앞에서 호출한다. 아니면 예외를 던진다. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return session;
}
