import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { enabledProviders, startAuthorization } from "@/lib/auth/social";
import { isSocialProvider, safeNext } from "@/lib/auth/social-profile";
import { siteUrl } from "@/lib/site-url";
import {
  SIGNUP_INTENT_COOKIE,
  SIGNUP_INTENT_SECONDS,
  encodeIntent,
  intentFromParams,
} from "@/lib/auth/signup-intent";

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

  /*
    사이트 주소(SITE_URL)가 아닌 주소로 들어왔으면 먼저 그 주소로 옮겨 다시 시작한다.
    서비스는 SITE_URL 쪽으로 돌려보내는데 state 쿠키는 브라우저가 지금 주소에만 붙인다.
    www.cccr.or.kr 로 들어와 시작하면 cccr.or.kr 로 돌아왔을 때 쿠키가 없어 늘 실패한다.
  */
  const home = new URL(siteUrl());
  const host = request.headers.get("host");
  if (host && host !== home.host) {
    const moved = new URL(`/api/auth/${provider}`, home);
    /* 가입 화면에서 고른 유형·동의도 함께 넘긴다. 빠뜨리면 다녀온 뒤 또 묻게 된다 */
    moved.search = request.nextUrl.search;
    const next = request.nextUrl.searchParams.get("next");
    if (next) moved.searchParams.set("next", safeNext(next));
    return NextResponse.redirect(moved);
  }

  const { url, state, codeVerifier } = startAuthorization(provider);

  const store = await cookies();
  store.set("c3r_oauth_state", state, OAUTH_COOKIE_OPTIONS);
  store.set("c3r_oauth_verifier", codeVerifier, OAUTH_COOKIE_OPTIONS);
  store.set("c3r_oauth_next", safeNext(request.nextUrl.searchParams.get("next")), OAUTH_COOKIE_OPTIONS);

  /*
    가입 화면(둘째 단계)에서 왔으면 고른 유형과 약관 동의를 적어 둔다(signup-intent.ts).
    다녀온 뒤 가입 화면이 읽어 또 묻지 않는다. 가입 화면은 /signup 아래라 쿠키 경로를 넓힌다.

    로그인 단추로 왔으면 지운다. 전에 가입하다 만 동의가 남아 있다가 새 계정에
    저절로 붙으면, 그 사람은 이번에 동의한 적이 없다.
  */
  const intent = intentFromParams((key) => request.nextUrl.searchParams.get(key));
  if (intent) {
    store.set(SIGNUP_INTENT_COOKIE, encodeIntent(intent), {
      ...OAUTH_COOKIE_OPTIONS,
      path: "/",
      maxAge: SIGNUP_INTENT_SECONDS,
    });
  } else {
    store.delete({ name: SIGNUP_INTENT_COOKIE, path: "/" });
  }

  return NextResponse.redirect(url);
}
