import "server-only";
import { randomBytes } from "node:crypto";

/*
  조회 토큰.

  접수번호 형식은 lib/request-ref.ts 에 있다. 규칙만 있는 부분이라 서버 밖에서도
  불러 쓸 수 있게 떼어 두었고, 여기서는 그대로 다시 내보낸다.

  토큰은 주소창에 붙는 값이라 추측할 수 없어야 한다. 접수번호는 규칙이 뻔해서
  남의 신청을 들여다볼 수 있으므로 조회에 쓰지 않는다.
  (접수번호로 조회할 때는 이메일을 함께 받아 맞춰 본다.)
*/
export { REF_PREFIX, makeRef, normalizeRef, type RequestKind } from "@/lib/request-ref";

export function newLookupToken(): string {
  return randomBytes(16).toString("hex");
}
