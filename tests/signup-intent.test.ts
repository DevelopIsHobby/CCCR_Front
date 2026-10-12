import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeIntent, encodeIntent, intentFromParams } from "../src/lib/auth/signup-intent.ts";

/*
  가입 의사(회원 유형 + 약관 동의)를 단계 사이로 넘기는 값.
  필수 동의가 빠졌는데 의사로 치면, 동의 없이 가입 신청서까지 가게 된다.
*/

const params = (q: string) => {
  const p = new URLSearchParams(q);
  return (k: string) => p.get(k);
};

test("유형과 필수 동의 둘이 있으면 의사로 친다", () => {
  assert.deepEqual(intentFromParams(params("type=personal&agreeTerms=on&agreePrivacy=on")), {
    memberType: "개인",
    newsletter: false,
  });
  assert.deepEqual(
    intentFromParams(params("type=company&agreeTerms=on&agreePrivacy=on&agreeNewsletter=on")),
    { memberType: "기업", newsletter: true },
  );
});

test("필수 동의가 하나라도 빠지면 의사가 아니다", () => {
  assert.equal(intentFromParams(params("type=personal&agreeTerms=on")), null);
  assert.equal(intentFromParams(params("type=personal&agreePrivacy=on")), null);
  assert.equal(intentFromParams(params("type=personal")), null);
});

test("모르는 유형은 받지 않는다", () => {
  /* '회원사'는 사람의 유형이 아니다. 회원사 가입은 안내 화면으로 보낸다 */
  assert.equal(intentFromParams(params("type=member&agreeTerms=on&agreePrivacy=on")), null);
  assert.equal(intentFromParams(params("agreeTerms=on&agreePrivacy=on")), null);
});

test("쿠키에 담았다 꺼내면 그대로다", () => {
  for (const intent of [
    { memberType: "개인" as const, newsletter: true },
    { memberType: "기업" as const, newsletter: false },
  ]) {
    assert.deepEqual(decodeIntent(encodeIntent(intent)), intent);
  }
});

test("망가진 쿠키 값은 버린다", () => {
  for (const raw of [undefined, null, "", "personal", "personal.2", "hacker.1", "personal.1;x"]) {
    assert.equal(decodeIntent(raw), null, `'${raw}' 를 받았다`);
  }
});
