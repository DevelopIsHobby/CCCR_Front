/*
  회원 관련 타입과 표시 문구.
  관리자 화면(클라이언트 컴포넌트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
import type { SocialProvider } from "@/lib/auth/social-profile";

export type UserStatus = "pending" | "active" | "blocked";
export type UserRole = "admin" | "member";

/*
  회원 구분. 가입할 때 첫 화면에서 고른다.

  개인 — 소속 없이 조합 소식·교육·행사 정보를 받는 분
  기업 — 기업·공공기관·협회 등에 소속된 담당자. 조합 회원사 직원도 여기로 가입한다

  '회원사'는 사람의 구분이 아니다. 가입 화면의 '회원사 가입'은 기관이 새로 조합에
  가입하는 것이라 온라인 절차가 없고 회원사 가입안내로 보낸다.
  권한 판단에는 쓰지 않는다. 사무국이 승인할 때 참고하는 정보다.
  이 칸이 생기기 전 계정은 null 이다.
*/
export type MemberType = "개인" | "기업";
export const MEMBER_TYPES: MemberType[] = ["개인", "기업"];

export const MEMBER_TYPE_LABEL: Record<MemberType, string> = {
  개인: "개인회원",
  기업: "기업회원",
};

/** 가입 화면에서 고를 때 돕는 설명 */
export const MEMBER_TYPE_HINT: Record<MemberType, string> = {
  개인: "소속 없이 조합 소식과 교육·행사 정보를 받는 분",
  기업: "기업·공공기관·협회 등에 소속된 담당자 (조합 회원사 직원 포함)",
};

/* 주소창에 쓰는 이름. 한글을 주소에 넣으면 공유할 때 %EA… 로 깨져 보인다. */
const SLUG: Record<MemberType, string> = { 개인: "personal", 기업: "company" };

export function memberTypeSlug(t: MemberType): string {
  return SLUG[t];
}

export function memberTypeFromSlug(slug: string | null | undefined): MemberType | null {
  return MEMBER_TYPES.find((t) => SLUG[t] === slug) ?? null;
}

export function isMemberType(value: string): value is MemberType {
  return (MEMBER_TYPES as string[]).includes(value);
}

export type UserRow = {
  id: number;
  email: string;
  name: string;
  company: string | null;
  department: string | null;
  phone: string | null;
  bizNumber: string | null;
  /** 회원 구분. 이 칸이 생기기 전에 가입한 계정은 null */
  memberType: MemberType | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  /** 이어 둔 소셜 계정. 목록에서만 채운다. */
  providers?: SocialProvider[];
  /** 같은 사람일 수 있는 다른 계정. 목록에서만 채운다(lib/db/users.ts). */
  dupes?: DuplicateHint[];
};

/**
 * 중복 의심.
 * 휴대전화번호는 가입 때 막으므로 여기 걸리는 것은 이름·회사·사업자번호가 겹치는 경우다.
 * 같은 회사의 다른 담당자처럼 정당한 경우가 있어 막지 않고 보여 주기만 한다.
 */
export type DuplicateField = "name" | "bizNumber";

export type DuplicateHint = {
  /** 무엇이 겹치는가. 둘 다 겹치면 둘 다 적는다 — 함께 겹칠수록 같은 사람일 가능성이 높다. */
  fields: DuplicateField[];
  id: number;
  email: string;
  name: string;
  company: string | null;
  status: UserStatus;
  createdAt: string;
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  pending: "승인 대기",
  active: "이용 중",
  blocked: "차단",
};
