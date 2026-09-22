/* 검사(tests/csv.test.ts)가 이 파일을 그대로 불러올 수 있도록 상대 경로로 적는다.
   node 의 검사 실행기는 tsconfig 의 `@/` 별칭을 모른다. */
import { today } from "./format.ts";

/*
  표(CSV) 로 내보내기.

  내려받기 화면 셋이 같은 코드를 저마다 들고 있었다. 한곳에 모은다.

  엑셀이 한글을 깨뜨리지 않도록 앞에 BOM 을 붙인다. 이것이 없으면 파일을
  열었을 때 글자가 전부 깨져 결국 메모장으로 열어 고쳐 쓰게 된다.
*/
/*
  빈 값은 빈 칸으로 둔다.

  예전에는 부르는 쪽에서 String() 을 먼저 씌워 넘겼다. 그러면 여기 닿기도 전에
  빈 값이 'null' 이라는 글자가 되어, 연락처를 적지 않은 신청자의 칸에 null 이
  찍힌다. 사무국은 그것을 적힌 값으로 읽는다.
*/
const escape = (v: unknown) =>
  `"${(v === null || v === undefined ? "" : String(v)).replace(/"/g, '""')}"`;

export function toCsv(header: string[], rows: (string | number)[][]): string {
  /* 줄이 하나도 없을 때 빈 줄만 남지 않도록 머리글과 함께 이어 붙인다 */
  const lines = [
    header.map(escape).join(","),
    ...rows.map((row) => row.map((cell) => escape(cell)).join(",")),
  ];
  return `﻿${lines.join("\n")}\n`;
}

/** 내려받기 응답. 파일 이름 뒤에 오늘 날짜(한국)를 붙여 언제 뽑은 것인지 남긴다. */
export function csvResponse(name: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${today()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
