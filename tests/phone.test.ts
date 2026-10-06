import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPhone, isMobilePhone, normalizePhone } from "../src/lib/phone.ts";

/*
  휴대전화번호.
  이 번호로 계정 중복을 막으므로, 같은 번호를 다르게 적었을 때 다른 번호로 보면
  중복 거부가 통째로 무너진다. 적는 방식을 바꿔 가며 같은 값이 되는지 본다.
*/

test("적는 방식이 달라도 같은 번호로 본다", () => {
  const expected = "01012345678";
  for (const raw of [
    "01012345678",
    "010-1234-5678",
    "010 1234 5678",
    "  010-1234-5678  ",
    "+82 10-1234-5678",
    "+82 010 1234 5678",
    "8201012345678",
  ]) {
    assert.equal(normalizePhone(raw), expected, `'${raw}' 가 다르게 풀렸다`);
  }
});

test("다른 번호는 다르게 본다", () => {
  assert.notEqual(normalizePhone("010-1234-5678"), normalizePhone("010-1234-5679"));
});

test("휴대전화번호만 받는다", () => {
  /* 010 은 열한 자리로 굳었고, 옛 식별번호는 열 자리도 있다 */
  assert.equal(isMobilePhone("01012345678"), true);
  assert.equal(isMobilePhone("0111234567"), true);
  assert.equal(isMobilePhone("01612345678"), true);
});

test("일반전화는 받지 않는다", () => {
  /*
    사무실 대표번호는 한 회사 사람들이 같이 쓴다. 그것으로 중복을 막으면
    같은 회사의 두 번째 담당자가 가입하지 못한다.
  */
  assert.equal(isMobilePhone(normalizePhone("02-2052-0156")), false);
  assert.equal(isMobilePhone(normalizePhone("031-123-4567")), false);
  assert.equal(isMobilePhone(normalizePhone("1588-1588")), false);
});

test("자릿수가 모자라거나 남으면 받지 않는다", () => {
  assert.equal(isMobilePhone("0101234"), false);
  assert.equal(isMobilePhone("010123456789"), false);
  assert.equal(isMobilePhone(""), false);
});

test("글자가 섞여 있어도 숫자만 남긴다", () => {
  assert.equal(normalizePhone("010-1234-5678 (회사)"), "01012345678");
});

test("보기 좋게 줄표를 넣는다", () => {
  assert.equal(formatPhone("01012345678"), "010-1234-5678");
  assert.equal(formatPhone("0111234567"), "011-123-4567");
  /* 길이가 다르면 손대지 않는다 */
  assert.equal(formatPhone("12345"), "12345");
});
