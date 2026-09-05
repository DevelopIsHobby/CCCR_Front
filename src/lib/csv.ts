/*
  표(CSV) 로 내보내기.

  내려받기 화면이 넷으로 늘어 같은 코드를 네 번 쓰게 되었다. 한곳에 모은다.

  엑셀이 한글을 깨뜨리지 않도록 앞에 BOM 을 붙인다. 이것이 없으면 파일을
  열었을 때 글자가 전부 깨져 결국 메모장으로 열어 고쳐 쓰게 된다.
*/
const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(header: string[], rows: (string | number)[][]): string {
  /* 줄이 하나도 없을 때 빈 줄만 남지 않도록 머리글과 함께 이어 붙인다 */
  const lines = [
    header.map(escape).join(","),
    ...rows.map((row) => row.map((cell) => escape(String(cell))).join(",")),
  ];
  return `﻿${lines.join("\n")}\n`;
}

/** 내려받기 응답. 파일 이름 뒤에 오늘 날짜를 붙여 언제 뽑은 것인지 남긴다. */
export function csvResponse(name: string, csv: string): Response {
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
