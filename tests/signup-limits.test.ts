import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSignupLengths, SIGNUP_MAX } from "../src/lib/auth/signup-limits.ts";

/*
  회원가입 칸별 최대 길이.
  화면의 maxLength 는 요청을 직접 보내면 넘을 수 있어 서버에서 한 번 더 막는다.
  너무 긴 값이 들어가면 관리자 회원 목록과 사무국 알림 메일 제목이 깨진다.
*/

const ok = { email: "a@b.kr", name: "홍길동", company: "(주)조합", department: "", phone: "" };

test("평범한 값은 통과한다", () => {
  assert.equal(checkSignupLengths(ok), null);
});

test("최대 길이까지는 통과하고 한 글자라도 넘으면 막는다", () => {
  assert.equal(checkSignupLengths({ ...ok, company: "가".repeat(SIGNUP_MAX.company) }), null);
  assert.equal(
    checkSignupLengths({ ...ok, company: "가".repeat(SIGNUP_MAX.company + 1) }),
    `기관·회사명은 ${SIGNUP_MAX.company}자 이내로 적어 주세요.`,
  );
});

test("어느 칸이 넘었는지 알려 준다", () => {
  assert.match(checkSignupLengths({ ...ok, name: "가".repeat(51) }) ?? "", /담당자 이름/);
  assert.match(checkSignupLengths({ ...ok, phone: "0".repeat(31) }) ?? "", /연락처/);
});

test("선택 칸을 비워 두거나 아예 보내지 않아도 된다", () => {
  assert.equal(checkSignupLengths({ email: "a@b.kr", name: "홍", company: "조합" }), null);
});
