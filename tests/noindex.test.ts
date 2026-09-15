import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isNoindex } from "../src/lib/site-url.ts";

/*
  검색 차단 판단.
  미리보기 주소(vercel.app)는 저절로 막고, SITE_NOINDEX 로 어느 쪽이든 못박을 수 있다.
*/

const saved = { SITE_URL: process.env.SITE_URL, SITE_NOINDEX: process.env.SITE_NOINDEX };

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("vercel.app 주소면 따로 정하지 않아도 막는다", () => {
  process.env.SITE_URL = "https://cccr-front.vercel.app";
  delete process.env.SITE_NOINDEX;
  assert.equal(isNoindex(), true);
});

test("정식 도메인이면 연다", () => {
  process.env.SITE_URL = "https://www.cccr.or.kr";
  delete process.env.SITE_NOINDEX;
  assert.equal(isNoindex(), false);
});

test("SITE_NOINDEX=1 이면 정식 도메인이어도 막는다", () => {
  process.env.SITE_URL = "https://www.cccr.or.kr";
  process.env.SITE_NOINDEX = "1";
  assert.equal(isNoindex(), true);
});

test("SITE_NOINDEX=0 이면 vercel.app 이어도 연다", () => {
  process.env.SITE_URL = "https://cccr-front.vercel.app";
  process.env.SITE_NOINDEX = "0";
  assert.equal(isNoindex(), false);
});

test("주소 끝이 vercel.app 처럼 보이기만 하는 다른 도메인은 막지 않는다", () => {
  process.env.SITE_URL = "https://notvercel.app.example.com";
  delete process.env.SITE_NOINDEX;
  assert.equal(isNoindex(), false);
});
