import "server-only";
import { randomBytes } from "node:crypto";

/*
  접수번호와 조회 토큰.

  접수번호(ref)는 사람이 전화로 부르고 메일에 적는 값이다. 짧고, 어느 창구인지
  바로 보이고, 날짜가 드러나야 사무국이 찾기 쉽다.
    RM-260903-0042   회의실 · 2026-09-03 접수 · 42번째
  뒤 네 자리는 그 표의 id 라 같은 표 안에서 겹치지 않는다.

  조회 토큰(lookup_token)은 주소창에 붙는 값이라 추측할 수 없어야 한다.
  접수번호는 규칙이 뻔해서 남의 신청을 들여다볼 수 있으므로 조회에 쓰지 않는다.
  (접수번호로 조회할 때는 이메일을 함께 받아 맞춰 본다.)
*/

export const REF_PREFIX = {
  notice: "NT",
  proposal: "ED",
  room: "RM",
  promo: "PR",
} as const;

export type RequestKind = keyof typeof REF_PREFIX;

/** 'YYYY-MM-DD HH:MM:SS' 에서 'YYMMDD' 만 뽑는다. */
function yymmdd(stamp: string): string {
  return stamp.slice(2, 10).replace(/-/g, "");
}

export function makeRef(kind: RequestKind, id: number, createdAt: string): string {
  return `${REF_PREFIX[kind]}-${yymmdd(createdAt)}-${String(id).padStart(4, "0")}`;
}

export function newLookupToken(): string {
  return randomBytes(16).toString("hex");
}

/** 사용자가 적어 넣은 접수번호를 견주기 좋게 다듬는다. 소문자·공백을 허용한다. */
export function normalizeRef(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
