import { test } from "node:test";
import assert from "node:assert/strict";
import { likeContains } from "../src/lib/like.ts";

/*
  LIKE 검색어 만들기.
  틀리면 '%' 한 글자 검색에 모든 글이 나오거나, '\' 가 들어간 검색어가 엉뚱하게 걸린다.
*/

test("평범한 검색어는 앞뒤에 % 만 붙인다", () => {
  assert.equal(likeContains("클라우드"), "%클라우드%");
});

test("% 와 _ 는 글자 그대로 찾게 앞에 \\ 를 붙인다", () => {
  assert.equal(likeContains("100%"), "%100\\%%");
  assert.equal(likeContains("file_name"), "%file\\_name%");
});

test("\\ 자체도 글자 그대로 찾는다", () => {
  assert.equal(likeContains("C:\\data"), "%c:\\\\data%");
});

/*
  SQLite 의 LIKE 는 영문 대소문자를 가리지 않지만 PostgreSQL 은 가린다.
  검색어를 낮춰 두고 쿼리에서 LOWER(칸) 과 짝을 맞춘다. 한쪽만 낮추면 아무것도 안 걸린다.
*/
test("영문은 소문자로 낮춘다", () => {
  assert.equal(likeContains("CCCR"), "%cccr%");
  assert.equal(likeContains("SaaS"), "%saas%");
  assert.equal(likeContains("Hong@CCCR.or.kr"), "%hong@cccr.or.kr%");
});

test("한글은 낮출 것이 없어 그대로다", () => {
  assert.equal(likeContains("클라우드"), "%클라우드%");
});
