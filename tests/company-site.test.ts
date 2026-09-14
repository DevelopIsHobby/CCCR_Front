import { test } from "node:test";
import assert from "node:assert/strict";
import { companySiteHref, companySiteLabel, normalizeCompanySite } from "../src/lib/company-types.ts";

/*
  회원사 홈페이지 주소.
  대개 https 로 열리지만 http 로만 열리는 곳이 있어, 그런 곳만 http:// 를 붙여 저장한다.
*/

test("https:// 와 끝의 / 는 떼고 저장한다", () => {
  assert.equal(normalizeCompanySite("https://nobreak.kr/"), "nobreak.kr");
  assert.equal(normalizeCompanySite("  HTTPS://www.sk.co.kr  "), "www.sk.co.kr");
  assert.equal(normalizeCompanySite("www.tilon.com/home"), "www.tilon.com/home");
});

test("http:// 는 남긴다", () => {
  assert.equal(normalizeCompanySite("http://www.dinnoit.com/"), "http://www.dinnoit.com");
  assert.equal(normalizeCompanySite("HTTP://www.dinnoit.com"), "http://www.dinnoit.com");
});

test("앞머리가 없으면 https 로 잇는다", () => {
  assert.equal(companySiteHref("www.tilon.com/home"), "https://www.tilon.com/home");
  assert.equal(companySiteHref("http://www.dinnoit.com"), "http://www.dinnoit.com");
});

test("화면에는 앞머리 없이 보인다", () => {
  assert.equal(companySiteLabel("http://www.dinnoit.com"), "www.dinnoit.com");
  assert.equal(companySiteLabel("nobreak.kr"), "nobreak.kr");
});
