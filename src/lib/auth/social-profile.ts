/*
  소셜 로그인 — 서비스가 돌려준 값을 우리 모양으로 옮기고, 들어온 사람을 어떻게 할지 정한다.

  바깥에 나가지 않는 계산만 모아 둔다. 관리자 화면(클라이언트)과 검사(테스트)에서도
  쓰므로 server-only 로 두지 않는다. 실제로 서비스와 주고받는 일은 social.ts 가 한다.
*/

export type SocialProvider = "google" | "kakao" | "naver";

/** 화면에 나오는 차례. 국내 이용자가 많이 쓰는 순서로 둔다. */
export const SOCIAL_PROVIDERS: SocialProvider[] = ["kakao", "naver", "google"];

export const SOCIAL_LABEL: Record<SocialProvider, string> = {
  kakao: "카카오",
  naver: "네이버",
  google: "구글",
};

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as string[]).includes(value);
}

export type SocialProfile = {
  provider: SocialProvider;
  /** 서비스가 주는 회원 식별값. 이메일과 달리 바뀌지 않는다. */
  subject: string;
  /** 없거나 형식이 틀리면 빈 값 */
  email: string;
  /** 서비스가 '이 이메일은 이 사람 것'이라고 확인해 주었는지 */
  emailVerified: boolean;
  name: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const text = (value: unknown): string => (typeof value === "string" ? value.trim().slice(0, 200) : "");

function cleanEmail(value: unknown): string {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return EMAIL.test(email) ? email : "";
}

/** 구글 ID 토큰의 내용(claims) */
export function profileFromGoogleClaims(claims: unknown): SocialProfile | null {
  const c = obj(claims);
  const subject = text(c.sub);
  if (!subject) return null;

  const email = cleanEmail(c.email);
  return {
    provider: "google",
    subject,
    email,
    emailVerified: Boolean(email) && c.email_verified === true,
    name: text(c.name),
  };
}

/** 카카오 사용자 정보(https://kapi.kakao.com/v2/user/me) */
export function profileFromKakao(body: unknown): SocialProfile | null {
  const b = obj(body);
  const subject = typeof b.id === "number" || typeof b.id === "string" ? String(b.id) : "";
  if (!subject) return null;

  const account = obj(b.kakao_account);
  const email = cleanEmail(account.email);
  return {
    provider: "kakao",
    subject,
    email,
    /* 유효하고(is_email_valid) 확인된(is_email_verified) 주소만 믿는다 */
    emailVerified:
      Boolean(email) && account.is_email_valid === true && account.is_email_verified === true,
    name: text(obj(account.profile).nickname),
  };
}

/** 네이버 사용자 정보(https://openapi.naver.com/v1/nid/me) */
export function profileFromNaver(body: unknown): SocialProfile | null {
  const b = obj(body);
  if (b.resultcode !== "00") return null;

  const r = obj(b.response);
  const subject = text(r.id);
  if (!subject) return null;

  const email = cleanEmail(r.email);
  return {
    provider: "naver",
    subject,
    email,
    /*
      네이버는 이메일 확인 여부를 알려 주지 않는다. naver.com 주소만 네이버가 직접 관리하는
      주소라 확인된 것으로 본다. 다른 주소는 남의 주소를 적어 둔 것일 수 있어, 그것으로
      기존 회원 계정에 이어 붙이면 계정을 가로챌 수 있다.
    */
    emailVerified: email.endsWith("@naver.com"),
    name: text(r.name) || text(r.nickname),
  };
}

export type SocialDecision =
  | { kind: "login"; userId: number }
  | { kind: "link"; userId: number }
  | { kind: "signup" };

/**
 * 소셜로 들어온 사람을 어떻게 할지.
 * - 이미 이어 둔 계정이 있으면 그 회원으로 로그인
 * - 없지만 서비스가 확인해 준 이메일이 기존 회원과 같으면 그 회원에 잇는다
 * - 둘 다 아니면 가입 화면으로 (확인되지 않은 이메일로는 기존 회원에 잇지 않는다)
 */
export function decideSocialLogin(
  identityUserId: number | null,
  verifiedEmailUserId: number | null,
): SocialDecision {
  if (identityUserId) return { kind: "login", userId: identityUserId };
  if (verifiedEmailUserId) return { kind: "link", userId: verifiedEmailUserId };
  return { kind: "signup" };
}

/** 로그인 뒤 돌아갈 곳. 우리 사이트 안의 경로만 받는다(//evil.com 같은 것은 막는다). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
