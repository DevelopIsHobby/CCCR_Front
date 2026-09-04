/*
  접수번호 형식.

  server-only 인 refs.ts 와 떼어 둔다. 이 파일에는 규칙만 있고 비밀이 없어
  검사(테스트)에서 그대로 불러 쓸 수 있어야 하기 때문이다.
  토큰을 만드는 일처럼 서버에서만 해야 하는 것은 refs.ts 에 남는다.

  접수번호는 사람이 전화로 부르고 메일에 적는 값이다. 짧고, 어느 창구인지
  바로 보이고, 날짜가 드러나야 사무국이 찾기 쉽다.
    RM-260903-0042   회의실 · 2026-09-03 접수 · 42번째
  뒤 네 자리는 그 표의 id 라 같은 표 안에서 겹치지 않는다.
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

/** 사용자가 적어 넣은 접수번호를 견주기 좋게 다듬는다. 소문자·공백을 허용한다. */
export function normalizeRef(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
