/*
  사업공고 수신자와 교육사업 제안 타입.
  관리자 화면(클라이언트)에서도 쓰므로 server-only 모듈과 분리한다.
*/
export type SubscribeStatus = "active" | "unsubscribed";

export type NoticeSubscriber = {
  id: number;
  company: string;
  name: string;
  email: string;
  tel: string;
  status: SubscribeStatus;
  createdAt: string;
};

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
