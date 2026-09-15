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
  assert.equal(likeContains("C:\\data"), "%C:\\\\data%");
});
