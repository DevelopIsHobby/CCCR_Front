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

/** 홍보 내용의 최소 길이. 화면 안내와 서버 검사가 같은 수를 쓴다. */
export const MIN_PROMO_BODY = 20;

export type PromoStatus = "new" | "reading" | "running" | "done";

export const PROMO_STATUS_LABEL: Record<PromoStatus, string> = {
  new: "새 신청",
  reading: "검토 중",
  running: "홍보 중",
  done: "완료",
};

export type PromoRequest = {
  id: number;
  /** 접수번호. 신청자가 전화로 부르고 메일에 적혀 있는 값. */
  ref: string;
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
