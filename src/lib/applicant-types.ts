/*
  신청 폼을 미리 채우는 값.
  폼(클라이언트)과 조회(서버) 양쪽에서 쓰므로 server-only 모듈과 떼어 둔다.
  실제로 값을 읽어 오는 것은 lib/db/me.ts 다.
*/
export type Applicant = { name: string; email: string; org: string };

export const EMPTY_APPLICANT: Applicant = { name: "", email: "", org: "" };
