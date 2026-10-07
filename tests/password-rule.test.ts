import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordChecks, passwordProblem } from "../src/lib/auth/password-rule.ts";

/* 비밀번호 규칙: 8자 이상 + 영문과 숫자를 함께 (+ 흔한 비밀번호 거르기) */

test("8자 이상에 영문과 숫자가 함께 있으면 통과한다", () => {
  assert.equal(passwordProblem("cloud2026c3r"), null);
  assert.equal(passwordProblem("Abcdefg7"), null);
});

test("8자보다 짧으면 막는다", () => {
  assert.match(passwordProblem("abc1234") ?? "", /8자 이상/);
});

test("영문만 있으면 막는다", () => {
  assert.match(passwordProblem("onlyletters") ?? "", /영문과 숫자/);
});

test("숫자만 있으면 막는다", () => {
  assert.match(passwordProblem("2026100712") ?? "", /영문과 숫자/);
});

test("한글과 숫자만으로는 통과하지 못한다(영문이 있어야 한다)", () => {
  assert.match(passwordProblem("클라우드조합2026") ?? "", /영문과 숫자/);
});

test("규칙을 맞춰도 흔한 비밀번호는 막는다", () => {
  assert.ok(passwordProblem("password1"));
  assert.ok(passwordProblem("abcd1234"));
});

test("본인 이메일 앞부분과 같은 비밀번호는 막는다", () => {
  assert.ok(passwordProblem("hong2026", { email: "hong2026@example.com" }));
});

test("화면용 점검은 항목별로 맞았는지 알려 준다", () => {
  assert.deepEqual(passwordChecks(""), { length: false, letter: false, digit: false });
  assert.deepEqual(passwordChecks("abc"), { length: false, letter: true, digit: false });
  assert.deepEqual(passwordChecks("abcdefg1"), { length: true, letter: true, digit: true });
});
