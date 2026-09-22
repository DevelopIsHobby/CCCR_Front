import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../src/lib/csv.ts";

/*
  명단 내려받기(CSV).

  사무국이 엑셀로 열어 쓰는 파일이다. 한 칸이 밀리면 이메일 옆에 연락처가 아니라
  엉뚱한 값이 붙고, 그대로 메일을 보내게 된다. 내려받기 화면 셋이 저마다 같은 코드를
  들고 있다가 한 곳만 고쳐지는 일이 있어 한곳으로 모았다. 그 한곳을 여기서 잠가 둔다.
*/

const BOM = String.fromCharCode(0xfeff);
const NL = String.fromCharCode(10);

test("엑셀이 한글을 깨뜨리지 않도록 맨 앞에 BOM 을 둔다", () => {
  /* 이것이 없으면 열자마자 글자가 전부 깨져 결국 메모장으로 고쳐 쓰게 된다 */
  const csv = toCsv(["이메일"], [["a@b.kr"]]);
  assert.equal(csv[0], BOM);
});

test("줄이 하나도 없어도 빈 줄이 남지 않는다", () => {
  /* 아직 신청자가 없을 때. 예전에는 머리글 뒤에 빈 줄이 하나 더 붙었다 */
  const csv = toCsv(["이메일", "상태"], []);
  assert.equal(csv, `${BOM}"이메일","상태"${NL}`);
});

test("따옴표·쉼표·줄바꿈이 섞인 값도 한 칸으로 남는다", () => {
  /* 교육사업 제안 내용에는 줄바꿈과 쉼표가 흔하다 */
  const csv = toCsv(
    ["제목", "내용"],
    [[`"인용" 있는 제목`, `첫 줄${NL}둘째 줄, 쉼표`]],
  );
  assert.equal(
    csv,
    `${BOM}"제목","내용"${NL}"""인용"" 있는 제목","첫 줄${NL}둘째 줄, 쉼표"${NL}`,
  );
});

test("값이 비어 있어도 칸을 건너뛰지 않는다", () => {
  /* 연락처를 적지 않고 넣은 신청. 칸이 밀리면 그 아래가 전부 어긋난다 */
  const rows = [["김", null as unknown as string, "a@b.kr"]];
  const csv = toCsv(["이름", "연락처", "이메일"], rows);
  assert.equal(csv, `${BOM}"이름","연락처","이메일"${NL}"김","","a@b.kr"${NL}`);
});

test("숫자도 글자와 같은 칸 모양으로 적는다", () => {
  const csv = toCsv(["번호"], [[7]]);
  assert.equal(csv, `${BOM}"번호"${NL}"7"${NL}`);
});
