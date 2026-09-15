import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSession } from "@/lib/auth/session";
import { enabledProviders, finishAuthorization } from "@/lib/auth/social";
import { decideSocialLogin, isSocialProvider, safeNext } from "@/lib/auth/social-profile";
import { SIGNUP_COOKIE, SIGNUP_MINUTES, hashSignupToken } from "@/lib/auth/social-signup";
import { now } from "@/lib/db/driver";
import { ready } from "@/lib/db/migrate";
import { siteUrl } from "@/lib/site-url";

/*
  소셜 로그인에서 돌아오는 곳.

  1) 우리가 보낸 요청인지 state 로 맞춰 본다
  2) code 로 서비스에서 회원 정보를 받는다
  3) 이어 둔 계정 → 로그인 / 확인된 이메일이 기존 회원과 같음 → 이어 붙이고 로그인
     / 그 밖 → 소속·동의를 받는 가입 화면으로
  승인 대기·차단 회원은 로그인시키지 않고 로그인 화면에서 까닭을 알려 준다.
*/
export const dynamic = "force-dynamic";

const OAUTH_COOKIES = ["c3r_oauth_state", "c3r_oauth_verifier", "c3r_oauth_next"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const back = (reason: string) =>
    NextResponse.redirect(new URL(`/login?social=${reason}`, siteUrl()));

  if (!isSocialProvider(provider) || !enabledProviders().includes(provider)) {
    return back("unavailable");
  }

  const store = await cookies();
  const savedState = store.get("c3r_oauth_state")?.value;
  const codeVerifier = store.get("c3r_oauth_verifier")?.value ?? "";
  const next = safeNext(store.get("c3r_oauth_next")?.value);
  /* 한 번 쓰면 버린다. 같은 값으로 두 번 돌아오는 것을 막는다. */
  for (const name of OAUTH_COOKIES) store.delete({ name, path: "/api/auth" });

  const query = request.nextUrl.searchParams;
  if (query.get("error")) return back("cancelled");

  const code = query.get("code");
  const state = query.get("state");
  if (!code || !state || !savedState || state !== savedState) return back("error");

  const profile = await finishAuthorization(provider, code, codeVerifier).catch(() => null);
  if (!profile) return back("error");

  const db = await ready();
  const identity = await db.get<{ user_id: number }>(
    "SELECT user_id FROM user_identities WHERE provider = ? AND subject = ?",
    [provider, profile.subject],
  );
  const emailUser =
    !identity && profile.emailVerified && profile.email
      ? await db.get<{ id: number }>("SELECT id FROM users WHERE email = ?", [profile.email])
      : undefined;

  const decision = decideSocialLogin(
    identity ? Number(identity.user_id) : null,
    emailUser ? Number(emailUser.id) : null,
  );

  if (decision.kind === "signup") {
    const token = randomBytes(32).toString("base64url");
    await db.run(
      `INSERT INTO oauth_signups
         (token_hash, provider, subject, email, email_verified, name, completed, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        hashSignupToken(token),
        provider,
        profile.subject,
        profile.email,
        profile.emailVerified ? 1 : 0,
        profile.name,
        new Date(Date.now() + SIGNUP_MINUTES * 60_000).toISOString(),
        now(),
      ],
    );
    store.set(SIGNUP_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SIGNUP_MINUTES * 60,
    });
    return NextResponse.redirect(new URL("/signup/social", siteUrl()));
  }

  if (decision.kind === "link") {
    await db.run(
      "INSERT INTO user_identities (user_id, provider, subject, email, created_at) VALUES (?, ?, ?, ?, ?)",
      [decision.userId, provider, profile.subject, profile.email, now()],
    );
  }

  const user = await db.get<{ status: string }>("SELECT status FROM users WHERE id = ?", [
    decision.userId,
  ]);
  if (!user) return back("error");
  if (user.status === "pending") return back("pending");
  if (user.status !== "active") return back("blocked");

  await createSession(decision.userId);
  return NextResponse.redirect(new URL(next, siteUrl()));
}
