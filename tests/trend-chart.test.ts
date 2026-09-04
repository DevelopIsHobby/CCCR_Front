import { test } from "node:test";
import assert from "node:assert/strict";
import { pickPoint } from "../src/lib/trend-geometry.ts";

/*
  그래프 말풍선 판정.

  선 위에 올렸을 때만 떠야 한다. 그래프 안이라고 아무 데서나 뜨면 빈 곳을
  지나가도 말풍선이 따라다녀 성가시다. 반대로 너무 빡빡하면 올려도 안 뜬다.

  좌표는 그림(viewBox) 기준이다. PAD.left = 46, 선에서 14 안쪽이면 잡힌다.
*/

/* 46 · 146 · 246 에 점이 하나씩. 높이는 100 → 50 → 100 (가운데가 솟은 산) */
const xy = [
  { x: 46, y: 100 },
  { x: 146, y: 50 },
  { x: 246, y: 100 },
];
const stepX = 100;

test("점 위에 올리면 그 날이 잡힌다", () => {
  assert.deepEqual(pickPoint({ x: 146, y: 50 }, xy, stepX), { index: 1, near: true });
});

test("가장 가까운 날로 붙는다", () => {
  /* 120 은 46 과 146 중 146 에 가깝다 */
  assert.equal(pickPoint({ x: 120, y: 63 }, xy, stepX)?.index, 1);
  assert.equal(pickPoint({ x: 80, y: 83 }, xy, stepX)?.index, 0);
});

test("선 위 빈 곳에서는 뜨지 않는다", () => {
  /* 가운데 봉우리는 y=50 인데 한참 위쪽(y=20)을 지나간다 */
  assert.equal(pickPoint({ x: 146, y: 20 }, xy, stepX)?.near, false);
});

test("선 아래 채운 곳에서도 뜨지 않는다", () => {
  assert.equal(pickPoint({ x: 146, y: 90 }, xy, stepX)?.near, false);
});

test("점과 점 사이 비탈에서도 선을 따라가면 잡힌다", () => {
  /* 46(y=100) 과 146(y=50) 의 한가운데는 y=75 여야 한다 */
  assert.equal(pickPoint({ x: 96, y: 75 }, xy, stepX)?.near, true);
  /* 같은 x 에서 위로 벗어나면 안 잡힌다 */
  assert.equal(pickPoint({ x: 96, y: 40 }, xy, stepX)?.near, false);
});

test("조금 빗나가도 잡아 준다", () => {
  /* 손이 떨려 몇 px 벗어나는 것까지 놓치면 쓰기 어렵다 */
  assert.equal(pickPoint({ x: 146, y: 60 }, xy, stepX)?.near, true);
  assert.equal(pickPoint({ x: 146, y: 40 }, xy, stepX)?.near, true);
});

test("양 끝 밖으로 나가도 끝 날에 머문다", () => {
  assert.equal(pickPoint({ x: -50, y: 100 }, xy, stepX)?.index, 0);
  assert.equal(pickPoint({ x: 900, y: 100 }, xy, stepX)?.index, 2);
});

test("점이 없으면 아무것도 고르지 않는다", () => {
  assert.equal(pickPoint({ x: 100, y: 100 }, [], stepX), null);
  assert.equal(pickPoint({ x: 100, y: 100 }, xy, 0), null);
});
