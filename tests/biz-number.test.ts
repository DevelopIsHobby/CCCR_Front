import { test } from "node:test";
import assert from "node:assert/strict";
import { formatBizNumber, isBizNumber, normalizeBizNumber } from "../src/lib/biz-number.ts";

/*
  사업자등록번호.
  검증식을 잘못 옮기면 멀쩡한 회원사가 가입하지 못하거나, 엉터리 번호가 그대로 들어온다.
  실제로 쓰이는 번호로 확인한다.
*/

/*
  검증식을 통과하는 번호. 끝자리는 국세청 검증식으로 손계산해 넣었다.
  구현을 그대로 베껴 만든 값이 아니어야 검사하는 뜻이 있다.
*/
const VALID = ["1208147521", "2208100127", "1248100998"];

test("검증식에 맞는 번호를 통과시킨다", () => {
  for (const n of VALID) assert.equal(isBizNumber(n), true, `${n} 가 막혔다`);
});

test("한 자리만 틀려도 걸러낸다", () => {
  /* 검증식이 도는지 보는 핵심. 끝자리를 바꾸면 전부 틀려야 한다 */
  for (const n of VALID) {
    const last = Number(n[9]);
    for (let d = 0; d <= 9; d += 1) {
      if (d === last) continue;
      assert.equal(isBizNumber(n.slice(0, 9) + d), false, `${n.slice(0, 9)}${d} 가 통과했다`);
    }
  }
});

test("줄표를 넣어 적어도 받는다", () => {
  assert.equal(normalizeBizNumber("120-81-47521"), "1208147521");
  assert.equal(isBizNumber(normalizeBizNumber("120-81-47521")), true);
});

test("자릿수가 안 맞으면 받지 않는다", () => {
  assert.equal(isBizNumber("12081475"), false);
  assert.equal(isBizNumber("12081475210"), false);
  assert.equal(isBizNumber(""), false);
  assert.equal(isBizNumber("12081475ab"), false);
});

test("보기 좋게 줄표를 넣는다", () => {
  assert.equal(formatBizNumber("1208147521"), "120-81-47521");
  assert.equal(formatBizNumber("123"), "123");
});
