import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { enabledProviders, startAuthorization } from "@/lib/auth/social";
import { isSocialProvider, safeNext } from "@/lib/auth/social-profile";
import { siteUrl } from "@/lib/site-url";

/*
  소셜 로그인 시작. 서비스의 로그인 화면으로 보낸다.

  돌아왔을 때 우리가 보낸 요청인지 맞춰 보도록 state 를, 구글은 PKCE 확인값도 함께
  짧게(10분) 쿠키에 둔다. 돌아올 곳(next)도 사이트 안의 경로만 받아 둔다.
*/
export const dynamic = "force-dynamic";

const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
  maxAge: 600,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isSocialProvider(provider) || !enabledProviders().includes(provider)) {
    return NextResponse.redirect(new URL("/login?social=unavailable", siteUrl()));
  }

  const { url, state, codeVerifier } = startAuthorization(provider);

  const store = await cookies();
  store.set("c3r_oauth_state", state, OAUTH_COOKIE_OPTIONS);
  store.set("c3r_oauth_verifier", codeVerifier, OAUTH_COOKIE_OPTIONS);
  store.set("c3r_oauth_next", safeNext(request.nextUrl.searchParams.get("next")), OAUTH_COOKIE_OPTIONS);

  return NextResponse.redirect(url);
}
