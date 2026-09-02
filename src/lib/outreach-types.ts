/*
  사업공고 수신자와 교육사업 제안 타입.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
/*
  사업공고는 임원사에게만 보내는 것이 원칙이라 신청을 받았다고 바로 보내지 않는다.
  pending(승인 대기) → active(수신 중) 또는 rejected(반려) 를 사무국이 정한다.
*/
export type SubscribeStatus = "pending" | "active" | "rejected" | "unsubscribed";

export const SUBSCRIBE_STATUS_LABEL: Record<SubscribeStatus, string> = {
  pending: "승인 대기",
  active: "수신 중",
  rejected: "반려",
  unsubscribed: "수신 중단",
};

export type NoticeSubscriber = {
  id: number;
  company: string;
  name: string;
  email: string;
  tel: string;
  status: SubscribeStatus;
  /** 반려 사유. 사무국이 남긴다. */
  note: string;
  createdAt: string;
};

/** 제안 내용의 최소 길이. 화면 안내와 서버 검사가 같은 수를 쓴다. */
export const MIN_PROPOSAL_BODY = 20;

export type ProposalStatus = "new" | "reading" | "done";

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  new: "새 제안",
  reading: "검토 중",
  done: "처리 완료",
};

export type EducationProposal = {
  id: number;
  org: string;
  name: string;
  email: string;
  tel: string;
  subject: string;
  body: string;
  status: ProposalStatus;
  createdAt: string;
};
