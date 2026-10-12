/*
  가입 의사 — 고른 회원 유형과 약관 동의.

  가입 화면은 세 단계다(회원 유형 → 약관 동의 → 정보 입력). 앞 두 단계에서 고른 것을
  셋째 단계까지 들고 가야 한다.

  이메일 가입은 주소창(?type=personal&agreeTerms=on…)으로 넘긴다. 다시 불러와도
  그대로 남고, 뒤로 가기를 누르면 앞 단계로 돌아간다. 개인정보는 들어 있지 않다.

  소셜 가입은 카카오·네이버·구글을 다녀오므로 주소창으로는 넘길 수 없다. 로그인을
  시작할 때(/api/auth/[provider]) 쿠키에 적어 두고, 돌아온 뒤 가입 화면이 읽는다.
  동의는 둘째 단계에서 이미 받았으니 다녀온 뒤에 또 묻지 않는다.

  필수 동의 둘이 다 있어야 의사로 친다. 하나라도 빠지면 null 이다.
  DB·서버 전용 코드를 부르지 않아 단위 시험에서 바로 불러 쓸 수 있다.
*/
import { memberTypeFromSlug, memberTypeSlug, type MemberType } from "../user-types.ts";

export const SIGNUP_INTENT_COOKIE = "c3r_signup_intent";

/* 로그인(최대 10분) + 가입 정보 작성(30분) 을 넉넉히 덮는다 */
export const SIGNUP_INTENT_SECONDS = 45 * 60;

export type SignupIntent = {
  memberType: MemberType;
  /** 뉴스레터 수신 동의(선택) */
  newsletter: boolean;
};

/** 주소창 값에서 읽는다. 체크 상자는 켜졌을 때만 'on' 으로 실려 온다. */
export function intentFromParams(get: (key: string) => string | null): SignupIntent | null {
  const memberType = memberTypeFromSlug(get("type"));
  if (!memberType) return null;
  if (!get("agreeTerms") || !get("agreePrivacy")) return null;
  return { memberType, newsletter: Boolean(get("agreeNewsletter")) };
}

/** 쿠키에 담는 꼴: 'personal.1' (유형.뉴스레터) */
export function encodeIntent(intent: SignupIntent): string {
  return `${memberTypeSlug(intent.memberType)}.${intent.newsletter ? 1 : 0}`;
}

export function decodeIntent(raw: string | null | undefined): SignupIntent | null {
  const m = /^([a-z]+)\.([01])$/.exec(raw ?? "");
  if (!m) return null;
  const memberType = memberTypeFromSlug(m[1]);
  if (!memberType) return null;
  return { memberType, newsletter: m[2] === "1" };
}
