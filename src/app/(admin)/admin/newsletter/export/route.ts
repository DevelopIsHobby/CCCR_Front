import { getSession } from "@/lib/auth/session";
import { csvResponse, toCsv } from "@/lib/csv";
import { logAdminAccess } from "@/lib/db/admin-access";
import { listSubscribers } from "@/lib/db/newsletter";
import { toKst } from "@/lib/format";

/* 구독자 명단 내려받기(CSV). */
export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  /* 개인정보가 담긴 명단이 밖으로 나가므로 관리자 접속 기록에 남긴다 */
  await logAdminAccess(session, "내려받기", `뉴스레터 구독자 명단 · ${new URL(request.url).search || "전체"}`);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const subscribers = await listSubscribers({
    status: status === "active" || status === "unsubscribed" ? status : "all",
  });

  const csv = toCsv(
    ["이메일", "상태", "신청 경로", "신청일"],
    subscribers.map((s) => [
      s.email,
      s.status === "active" ? "구독 중" : "해지",
      s.source,
      /* DB 시각은 UTC 라 한국 날짜로 바꿔 적는다 */
      toKst(s.createdAt).slice(0, 10),
    ]),
  );

  return csvResponse("newsletter", csv);
}
