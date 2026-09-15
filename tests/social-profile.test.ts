import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decideSocialLogin,
  profileFromGoogleClaims,
  profileFromKakao,
  profileFromNaver,
  safeNext,
} from "../src/lib/auth/social-profile.ts";

/*
  소셜 로그인 — 서비스가 준 값 옮기기와, 들어온 사람을 어떻게 할지.
  특히 '확인되지 않은 이메일로는 기존 회원에 잇지 않는다'를 지킨다.
*/

test("구글: email_verified 가 true 일 때만 확인된 이메일", () => {
  const verified = profileFromGoogleClaims({ sub: "g-1", email: "A@Example.com", email_verified: true, name: "홍길동" });
  assert.deepEqual(verified, { provider: "google", subject: "g-1", email: "a@example.com", emailVerified: true, name: "홍길동" });

  const unverified = profileFromGoogleClaims({ sub: "g-2", email: "b@example.com", email_verified: false });
  assert.equal(unverified?.emailVerified, false);

  assert.equal(profileFromGoogleClaims({ email: "c@example.com" }), null);
});

test("카카오: 유효하고 확인된 이메일만 믿고, 이메일이 없어도 가입은 된다", () => {
  const full = profileFromKakao({
    id: 12345,
    kakao_account: { email: "k@kakao.com", is_email_valid: true, is_email_verified: true, profile: { nickname: "카카오" } },
  });
  assert.deepEqual(full, { provider: "kakao", subject: "12345", email: "k@kakao.com", emailVerified: true, name: "카카오" });

  const notVerified = profileFromKakao({ id: 1, kakao_account: { email: "x@kakao.com", is_email_valid: true, is_email_verified: false } });
  assert.equal(notVerified?.emailVerified, false);

  const noEmail = profileFromKakao({ id: 2, kakao_account: { profile: { nickname: "이메일없음" } } });
  assert.equal(noEmail?.email, "");
  assert.equal(noEmail?.emailVerified, false);
});

test("네이버: resultcode 00 만 받고, naver.com 주소만 확인된 것으로 본다", () => {
  const naver = profileFromNaver({ resultcode: "00", response: { id: "n-1", email: "me@naver.com", name: "네이버" } });
  assert.equal(naver?.emailVerified, true);

  const other = profileFromNaver({ resultcode: "00", response: { id: "n-2", email: "me@company.com", nickname: "별명" } });
  assert.equal(other?.emailVerified, false);
  assert.equal(other?.name, "별명");

  assert.equal(profileFromNaver({ resultcode: "024", message: "Authentication failed" }), null);
});

test("이어 둔 계정 → 로그인, 확인된 이메일이 같음 → 잇기, 그 밖 → 가입", () => {
  assert.deepEqual(decideSocialLogin(7, null), { kind: "login", userId: 7 });
  assert.deepEqual(decideSocialLogin(7, 9), { kind: "login", userId: 7 });
  assert.deepEqual(decideSocialLogin(null, 9), { kind: "link", userId: 9 });
  assert.deepEqual(decideSocialLogin(null, null), { kind: "signup" });
});

test("돌아갈 곳은 사이트 안의 경로만", () => {
  assert.equal(safeNext("/mypage"), "/mypage");
  assert.equal(safeNext("//evil.com"), "/");
  assert.equal(safeNext("/\\evil.com"), "/");
  assert.equal(safeNext("https://evil.com"), "/");
  assert.equal(safeNext(null), "/");
});
