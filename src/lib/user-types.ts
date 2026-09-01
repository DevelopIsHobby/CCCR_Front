/*
  회원 관련 타입과 표시 문구.
  관리자 화면(클라이언트 컴포넌트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
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
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  pending: "승인 대기",
  active: "이용 중",
  blocked: "차단",
};
