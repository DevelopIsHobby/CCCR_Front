/*
  휴지통에 담기는 것들.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type TrashKind =
  | "post"
  | "company"
  | "notice"
  | "proposal"
  | "promo"
  | "room"
  | "aboutCard"
  | "department"
  | "history";

export type TrashRow = {
  kind: TrashKind;
  id: number;
  /** 무엇이었는지 한 줄로 알아볼 수 있는 이름 */
  title: string;
  /** 어디에 있던 것인지 */
  where: string;
  deletedAt: string;
};

export const TRASH_LABEL: Record<TrashKind, string> = {
  post: "게시글",
  company: "회원사",
  notice: "사업공고 수신자",
  proposal: "교육사업 제안",
  promo: "홍보 신청",
  room: "회의실 예약",
  aboutCard: "소개 페이지 항목",
  department: "부서",
  history: "연혁",
};

/** 지운 뒤 이만큼 지나면 야간 정리가 진짜로 지운다. */
export const TRASH_KEEP_DAYS = 30;
