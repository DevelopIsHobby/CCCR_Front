/*
  회원 관련 타입과 표시 문구.
  관리자 화면(클라이언트 컴포넌트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
import type { SocialProvider } from "@/lib/auth/social-profile";

export type UserStatus = "pending" | "active" | "blocked";
export type UserRole = "admin" | "member";

export type UserRow = {
  id: number;
  email: string;
  name: string;
  company: string | null;
  department: string | null;
  phone: string | null;
  bizNumber: string | null;
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
