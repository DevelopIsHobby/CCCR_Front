import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ready } from "@/lib/db/migrate";
import { now } from "@/lib/db/driver";

const COOKIE = "c3r_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7일

export type Session = {
  userId: number;
  name: string;
  email: string;
  role: "admin" | "member";
};

/* 쿠키에는 원문 토큰을, DB 에는 해시만 둔다. DB 가 새도 세션을 만들 수 없다. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number): Promise<void> {
  const db = await ready();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MAX_AGE_SEC * 1000);

  await db.run(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    [hashToken(token), userId, expiresAt.toISOString(), now()],
  );

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
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
  }>(
    `SELECT u.id, u.name, u.email, u.role, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
    [hashToken(token)],
  );

  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
    return null;
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
