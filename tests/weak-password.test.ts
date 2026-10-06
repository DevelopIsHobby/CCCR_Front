import { test } from "node:test";
import assert from "node:assert/strict";
import { weakPasswordReason } from "../src/lib/auth/weak-password.ts";

/*
  비밀번호 거르기.
  조합 규칙(특수문자 섞기)은 두지 않기로 했으므로, 이 검사가 유일한 그물이다.
  너무 촘촘하면 멀쩡한 비밀번호가 막히고, 너무 성기면 뻔한 값이 그대로 들어온다.
*/

test("흔한 비밀번호를 막는다", () => {
  for (const p of ["password", "12345678", "qwerty123", "1q2w3e4r", "welcome1"]) {
    assert.notEqual(weakPasswordReason(p), null, `'${p}' 가 통과했다`);
  }
});

test("대소문자를 바꿔도 막는다", () => {
  assert.notEqual(weakPasswordReason("PassWord"), null);
  assert.notEqual(weakPasswordReason("QWERTY123"), null);
});

test("같은 글자만 되풀이한 것을 막는다", () => {
  assert.notEqual(weakPasswordReason("aaaaaaaa"), null);
  assert.notEqual(weakPasswordReason("00000000"), null);
});

test("이메일이 들어간 비밀번호를 막는다", () => {
  const who = { email: "hongkildong@cccr.or.kr" };
  assert.notEqual(weakPasswordReason("hongkildong", who), null);
  assert.notEqual(weakPasswordReason("myhongkildong99", who), null);
  assert.notEqual(weakPasswordReason("hongkildong@cccr.or.kr", who), null);
});

test("아이디가 짧으면 우연히 겹친 것으로 보지 않는다", () => {
  /* a@cccr.or.kr 인 사람에게 'a' 가 든 비밀번호를 모두 막으면 쓸 수 있는 것이 없다 */
  assert.equal(weakPasswordReason("seoulrain2026", { email: "a@cccr.or.kr" }), null);
});

test("이름이 들어간 비밀번호를 막는다", () => {
  assert.notEqual(weakPasswordReason("gildong2026", { name: "gildong" }), null);
  assert.notEqual(weakPasswordReason("홍길동입니다", { name: "홍길동" }), null);
});

test("멀쩡한 비밀번호는 통과시킨다", () => {
  for (const p of ["보라색코끼리7", "jeju-island-2026", "ThisIsMyPassphrase", "n8kQ2wRt"]) {
    assert.equal(weakPasswordReason(p, { email: "hong@cccr.or.kr", name: "홍길동" }), null, `'${p}' 가 막혔다`);
  }
});
