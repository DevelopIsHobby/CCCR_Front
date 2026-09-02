import { getSession } from "@/lib/auth/session";
import { listNoticeSubscribers } from "@/lib/db/outreach";

/*
  사업공고 수신자 명단 내려받기(CSV).
  엑셀이 한글을 깨뜨리지 않도록 BOM 을 앞에 붙인다.
*/
export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const rows = await listNoticeSubscribers({
    status: status === "active" || status === "unsubscribed" ? status : "all",
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["회사명", "담당자", "이메일", "연락처", "상태", "신청일"];
  const lines = rows.map((r) =>
    [
      r.company,
      r.name,
      r.email,
      r.tel,
      r.status === "active" ? "수신 중" : "중단",
      r.createdAt.slice(0, 10),
    ]
      .map(escape)
      .join(","),
  );

  const csv = `\uFEFF${header.map(escape).join(",")}\n${lines.join("\n")}\n`;
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="notice-subscribers-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
