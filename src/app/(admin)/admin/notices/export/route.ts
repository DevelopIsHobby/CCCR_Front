import { getSession } from "@/lib/auth/session";
import { logAdminAccess } from "@/lib/db/admin-access";
import { listNoticeSubscribers } from "@/lib/db/outreach";
import { today, toKst } from "@/lib/format";

/*
  사업공고 수신자 명단 내려받기(CSV).
  엑셀이 한글을 깨뜨리지 않도록 BOM 을 앞에 붙인다.
*/
export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  /* 개인정보가 담긴 명단이 밖으로 나가므로 관리자 접속 기록에 남긴다 */
  await logAdminAccess(session, "내려받기", "사업공고 수신자 명단");

  /* 보낼 곳만 담는다. 승인 대기·반려·중단은 넣지 않는다. */
  const rows = await listNoticeSubscribers({ status: "active" });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["회사명", "담당자", "이메일", "연락처", "승인일"];
  const lines = rows.map((r) =>
    [
      r.company,
      r.name,
      r.email,
      r.tel,
      /* DB 시각은 UTC 라 한국 날짜로 바꿔 적는다 */
      toKst(r.createdAt).slice(0, 10),
    ]
      .map(escape)
      .join(","),
  );

  const csv = `﻿${header.map(escape).join(",")}\n${lines.join("\n")}\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="notice-subscribers-${today()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
