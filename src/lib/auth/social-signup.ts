import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { ready } from "@/lib/db/migrate";
import type { SocialProvider } from "./social-profile";

/*
  소셜로 처음 온 사람의 가입 대기 정보.

  서비스에서 받은 식별값·이메일·이름을 oauth_signups 에 30분만 두고, 브라우저에는
  그것을 찾을 토큰만 쿠키로 준다. 토큰 원문은 DB 에 두지 않는다(해시만).
*/

export const SIGNUP_COOKIE = "c3r_oauth_signup";
export const SIGNUP_MINUTES = 30;

export const hashSignupToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type PendingSocialSignup = {
  tokenHash: string;
  provider: SocialProvider;
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
  /** 가입 신청을 마쳤는지. 마친 뒤에도 기한 안에는 '접수되었습니다'를 보여 준다. */
  completed: boolean;
};

export async function getPendingSocialSignup(): Promise<PendingSocialSignup | null> {
  const token = (await cookies()).get(SIGNUP_COOKIE)?.value;
  if (!token) return null;

  const db = await ready();
  const row = await db.get<{
    token_hash: string;
    provider: string;
    subject: string;
    email: string;
    email_verified: number;
    name: string;
    completed: number;
  }>(
    `SELECT token_hash, provider, subject, email, email_verified, name, completed
       FROM oauth_signups
      WHERE token_hash = ? AND expires_at > ?`,
    [hashSignupToken(token), new Date().toISOString()],
  );
  if (!row) return null;

  return {
    tokenHash: row.token_hash,
    provider: row.provider as SocialProvider,
    subject: row.subject,
    email: row.email,
    emailVerified: Number(row.email_verified) === 1,
    name: row.name,
    completed: Number(row.completed) === 1,
  };
}
