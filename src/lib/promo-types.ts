/*
  홍보 서비스 신청 타입.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type PromoCadence = "once" | "weekly" | "biweekly" | "monthly";

export const CADENCES: { value: PromoCadence; label: string }[] = [
  { value: "once", label: "1회" },
  { value: "weekly", label: "주 1회" },
  { value: "biweekly", label: "격주 1회" },
  { value: "monthly", label: "월 1회" },
];

export const CADENCE_LABEL: Record<PromoCadence, string> = {
  once: "1회",
  weekly: "주 1회",
  biweekly: "격주 1회",
  monthly: "월 1회",
};

export type PromoStatus = "new" | "reading" | "running" | "done";

export const PROMO_STATUS_LABEL: Record<PromoStatus, string> = {
  new: "새 신청",
  reading: "검토 중",
  running: "홍보 중",
  done: "완료",
};

export type PromoRequest = {
  id: number;
  org: string;
  name: string;
  position: string;
  email: string;
  tel: string;
  subject: string;
  body: string;
  tagline: string;
  startOn: string;
  cadence: PromoCadence;
  imageUrl: string | null;
  file: { name: string; byteSize: number } | null;
  status: PromoStatus;
  createdAt: string;
};
