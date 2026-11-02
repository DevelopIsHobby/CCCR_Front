import { test } from "node:test";
import assert from "node:assert/strict";
import { shortUrl } from "../src/lib/url-display.ts";

/*
  링크 주소 줄여 보이기. 보여 주는 글자만 바꾸고 실제 주소는 건드리지 않는다.
*/

test("인코딩된 한글을 풀어 보여 준다", () => {
  const r = shortUrl("https://www.law.go.kr/lsSc.do?query=%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C", 100);
  assert.deepEqual(r, { host: "law.go.kr", rest: "/lsSc.do?query=클라우드" });
});

test("사이트 이름 앞의 www. 를 뗀다", () => {
  assert.equal(shortUrl("https://www.cccr.or.kr/").host, "cccr.or.kr");
  assert.equal(shortUrl("https://cccr.kr/board").host, "cccr.kr");
});

test("경로가 없으면 사이트 이름만", () => {
  assert.deepEqual(shortUrl("https://www.msit.go.kr/"), { host: "msit.go.kr", rest: "" });
});

test("정한 길이를 넘으면 자르고 … 를 붙인다", () => {
  const r = shortUrl(`https://example.com/${"가".repeat(60)}`, 10);
  assert.equal(r.rest, `/${"가".repeat(9)}…`);
  assert.equal(Array.from(r.rest).length, 11);
});

test("짧으면 자르지 않는다", () => {
  assert.equal(shortUrl("https://example.com/a?b=1").rest, "/a?b=1");
});

test("깨진 인코딩이 섞여도 멈추지 않는다", () => {
  /* %E0 뒤가 잘린 꼴. decodeURIComponent 가 던지는 값이다 */
  const r = shortUrl("https://example.com/%E0%A4%A", 100);
  assert.equal(r.host, "example.com");
  assert.equal(r.rest, "/%E0%A4%A");
});

test("주소 꼴이 아니어도 멈추지 않는다", () => {
  assert.deepEqual(shortUrl("그냥 글자", 100), { host: "", rest: "그냥 글자" });
});
