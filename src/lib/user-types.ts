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
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  /** 이어 둔 소셜 계정. 목록에서만 채운다. */
  providers?: SocialProvider[];
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  pending: "승인 대기",
  active: "이용 중",
  blocked: "차단",
};
