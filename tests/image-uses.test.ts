import { test } from "node:test";
import assert from "node:assert/strict";
import { mapImageUses } from "../src/lib/image-uses.ts";

/*
  글 본문에 걸린 그림 찾기.

  틀리면 쓰고 있는 그림이 '안 쓰는 그림' 으로 보여 정리할 때 지워질 수 있다.
  반대로 안 쓰는 그림이 '사용 중' 으로 보이면 서버 용량이 줄지 않는다.
*/

const post = (id: number, body: string | null, board = "notice") => ({
  id,
  title: `글 ${id}`,
  board,
  body,
});

test("1번 그림은 11번·12번 그림 주소에 걸리지 않는다", () => {
  const uses = mapImageUses([post(1, '<img src="/api/images/11"><img src="/api/images/12">')]);
  assert.equal(uses.has(1), false);
  assert.equal(uses.get(11)?.count, 1);
  assert.equal(uses.get(12)?.count, 1);
});

test("쓴 글 수를 세고, 가장 최근 글을 대표로 보여 준다", () => {
  const uses = mapImageUses([
    post(3, '<p><img src="/api/images/7"></p>', "events"),
    post(9, '<img src="/api/images/7">', "trends"),
    post(5, "그림 없음"),
  ]);
  assert.deepEqual(uses.get(7), { count: 2, postId: 9, title: "글 9", board: "trends" });
});

test("한 글에 같은 그림이 여러 번 있어도 한 번으로 센다", () => {
  const uses = mapImageUses([post(2, '<img src="/api/images/4"> 설명 <img src="/api/images/4">')]);
  assert.equal(uses.get(4)?.count, 1);
});

test("주소 뒤에 다른 글자가 붙어도 번호만 읽는다", () => {
  const uses = mapImageUses([post(8, '<img src="/api/images/15?w=640"><a href="/api/images/16">')]);
  assert.deepEqual([...uses.keys()].sort((a, b) => a - b), [15, 16]);
});

test("본문이 비어 있는 글은 건너뛴다", () => {
  assert.equal(mapImageUses([post(1, null), post(2, "")]).size, 0);
});
