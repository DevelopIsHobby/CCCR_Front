import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isNoindex } from "../src/lib/site-url.ts";

/*
  검색 차단 판단.

  정식 공개 전까지는 .env.production 의 SITE_NOINDEX=1 로 막아 둔다.
  공개하는 날 그 줄을 지우면 열린다.

  (2026-10 Vercel 미리보기를 걷어내면서 vercel.app 자동 차단도 함께 뺐다.
   운영 주소가 cccr.kr 하나뿐이라 주소로 가를 일이 없다.)
*/

const saved = { SITE_URL: process.env.SITE_URL, SITE_NOINDEX: process.env.SITE_NOINDEX };

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("SITE_NOINDEX=1 이면 막는다", () => {
  process.env.SITE_URL = "https://cccr.kr";
  process.env.SITE_NOINDEX = "1";
  assert.equal(isNoindex(), true);
});

test("SITE_NOINDEX 가 없으면 연다", () => {
  process.env.SITE_URL = "https://cccr.kr";
  delete process.env.SITE_NOINDEX;
  assert.equal(isNoindex(), false);
});

test("SITE_NOINDEX=0 이면 연다", () => {
  process.env.SITE_URL = "https://cccr.kr";
  process.env.SITE_NOINDEX = "0";
  assert.equal(isNoindex(), false);
});

test("앞뒤 빈칸이 섞여 있어도 1 이면 막는다", () => {
  process.env.SITE_URL = "https://cccr.kr";
  process.env.SITE_NOINDEX = " 1 ";
  assert.equal(isNoindex(), true);
});
