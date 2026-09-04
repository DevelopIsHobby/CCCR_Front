import { test } from "node:test";
import assert from "node:assert/strict";
import { makeRef, normalizeRef, REF_PREFIX } from "../src/lib/request-ref.ts";

/*
  접수번호.

  신청자가 전화로 부르고 메일에 적는 값이다. 형식이 흔들리면 사무국이 못 찾고,
  정규화가 느슨하면 조회가 안 된다.
*/

test("창구·접수일·순번이 그대로 드러난다", () => {
  assert.equal(makeRef("room", 42, "2026-09-03 05:15:00"), "RM-260903-0042");
  assert.equal(makeRef("notice", 7, "2026-09-03 05:15:00"), "NT-260903-0007");
  assert.equal(makeRef("proposal", 1, "2026-01-31 00:00:00"), "ED-260131-0001");
  assert.equal(makeRef("promo", 3, "2026-12-25 12:00:00"), "PR-261225-0003");
});

test("네 자리를 넘어가도 잘리지 않는다", () => {
  /* 신청이 만 건을 넘어도 번호는 유일해야 한다 */
  assert.equal(makeRef("room", 12345, "2026-09-03 00:00:00"), "RM-260903-12345");
});

test("창구마다 앞글자가 다르다", () => {
  const prefixes = Object.values(REF_PREFIX);
  assert.equal(new Set(prefixes).size, prefixes.length, "앞글자가 겹치면 창구를 구분할 수 없다");
});

test("사람이 적어 넣은 번호를 너그럽게 받는다", () => {
  /* 메일에서 복사하면 공백이 따라오고, 손으로 치면 소문자로 친다 */
  assert.equal(normalizeRef("rm-260903-0042"), "RM-260903-0042");
  assert.equal(normalizeRef("  RM-260903-0042  "), "RM-260903-0042");
  assert.equal(normalizeRef("RM- 260903 -0042"), "RM-260903-0042");
});

test("빈 값은 빈 값으로 둔다", () => {
  assert.equal(normalizeRef("   "), "");
});
