/*
  회원 관련 타입과 표시 문구.
  관리자 화면(클라이언트 컴포넌트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
import type { SocialProvider } from "@/lib/auth/social-profile";

export type UserStatus = "pending" | "active" | "blocked";
export type UserRole = "admin" | "member";

/*
  회원 구분. 가입할 때 스스로 고른다.
  사무국이 승인할 때 회원사인지 바로 알 수 있게 하려는 것이라, 고른 값을 그대로 믿지 않고
  회원사 명단과 견주어 승인한다. 이 칸이 생기기 전 계정은 null 이다.
*/
export type MemberType = "회원사" | "비회원사" | "유관기관";
export const MEMBER_TYPES: MemberType[] = ["회원사", "비회원사", "유관기관"];

/** 가입 화면에서 고를 때 돕는 설명 */
export const MEMBER_TYPE_HINT: Record<MemberType, string> = {
  회원사: "조합에 가입한 기관·기업",
  비회원사: "조합 회원이 아닌 기관·기업",
  유관기관: "정부·공공기관, 협회·단체",
};

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
