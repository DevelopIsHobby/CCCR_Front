import "server-only";
import { Google, Kakao, Naver, decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { siteUrl } from "@/lib/site-url";
import {
  SOCIAL_PROVIDERS,
  profileFromGoogleClaims,
  profileFromKakao,
  profileFromNaver,
  type SocialProfile,
  type SocialProvider,
} from "./social-profile";

/*
  소셜 로그인 — 서비스와 주고받는 부분.

  각 서비스 개발자 사이트에 앱을 등록하고 받은 값을 환경변수에 넣으면 그 서비스가 켜진다.
  값이 없으면 로그인 화면에 그 단추가 나오지 않는다. 등록 방법은 docs/social-login.md.

  돌아올 주소(redirect URI)는 SITE_URL 을 따른다. 서비스에 등록한 주소와 한 글자라도
  다르면 서비스가 거절하므로, 미리보기 주소와 정식 주소를 둘 다 등록해 둔다.
*/

const ENV: Record<SocialProvider, [id: string, secret: string]> = {
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  kakao: ["KAKAO_CLIENT_ID", "KAKAO_CLIENT_SECRET"],
  naver: ["NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"],
};

function credentials(provider: SocialProvider): { id: string; secret: string } | null {
  const [idKey, secretKey] = ENV[provider];
  const id = process.env[idKey]?.trim();
  const secret = process.env[secretKey]?.trim();
  return id && secret ? { id, secret } : null;
}

/** 환경변수가 갖춰진 서비스만, 화면에 나오는 차례대로 */
export function enabledProviders(): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter((provider) => credentials(provider) !== null);
}

export function callbackUrl(provider: SocialProvider): string {
  return `${siteUrl()}/api/auth/${provider}/callback`;
}

function need(provider: SocialProvider): { id: string; secret: string } {
  const found = credentials(provider);
  if (!found) throw new Error(`${provider} 로그인 설정이 없습니다.`);
  return found;
}

/** 서비스의 로그인 화면 주소를 만든다. state·codeVerifier 는 돌아왔을 때 맞춰 보도록 쿠키에 둔다. */
export function startAuthorization(provider: SocialProvider): {
  url: URL;
  state: string;
  codeVerifier: string;
} {
  const { id, secret } = need(provider);
  const redirect = callbackUrl(provider);
  const state = generateState();

  if (provider === "google") {
    const codeVerifier = generateCodeVerifier();
    const url = new Google(id, secret, redirect).createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);
    /* 여러 구글 계정을 쓰는 사람이 늘 고를 수 있게 한다 */
    url.searchParams.set("prompt", "select_account");
    return { url, state, codeVerifier };
  }

  if (provider === "kakao") {
    const url = new Kakao(id, secret, redirect).createAuthorizationURL(state, []);
    /*
      받을 항목(닉네임·이메일)은 카카오 개발자 사이트의 '동의항목'에서 정한다.
      여기서 scope 를 적으면 동의항목에 없는 것을 달라는 셈이 되어 거절될 수 있어 비운다.
    */
    url.searchParams.delete("scope");
    return { url, state, codeVerifier: "" };
  }

  const url = new Naver(id, secret, redirect).createAuthorizationURL();
  url.searchParams.set("state", state);
  return { url, state, codeVerifier: "" };
}

/** 돌아온 code 로 토큰을 받아 사용자 정보를 읽는다. 실패하면 null. */
export async function finishAuthorization(
  provider: SocialProvider,
  code: string,
  codeVerifier: string,
): Promise<SocialProfile | null> {
  const { id, secret } = need(provider);
  const redirect = callbackUrl(provider);

  if (provider === "google") {
    const tokens = await new Google(id, secret, redirect).validateAuthorizationCode(code, codeVerifier);
    /*
      ID 토큰은 우리 서버가 구글 토큰 창구에서 TLS 로 직접 받은 것이라 서명을 따로 확인하지 않는다.
      (브라우저를 거쳐 온 토큰이 아니다. 서버 간 코드 교환에서 흔히 쓰는 처리다.)
    */
    return profileFromGoogleClaims(decodeIdToken(tokens.idToken()));
  }

  const tokens =
    provider === "kakao"
      ? await new Kakao(id, secret, redirect).validateAuthorizationCode(code)
      : await new Naver(id, secret, redirect).validateAuthorizationCode(code);

  const endpoint =
    provider === "kakao" ? "https://kapi.kakao.com/v2/user/me" : "https://openapi.naver.com/v1/nid/me";

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const body: unknown = await res.json();
  return provider === "kakao" ? profileFromKakao(body) : profileFromNaver(body);
}
