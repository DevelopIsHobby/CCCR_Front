import { getSession } from "@/lib/auth/session";
import { listPromos } from "@/lib/db/promos";
import { csvResponse, toCsv } from "@/lib/csv";
import { CADENCE_LABEL, PROMO_STATUS_LABEL, type PromoStatus } from "@/lib/promo-types";

/*
  홍보 신청 내려받기(CSV).
  올린 그림과 첨부는 파일이라 표에 담을 수 없다. 있었는지만 적고,
  실물은 관리자 화면에서 본다.
*/
export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("status");
  const status = (["new", "reading", "running", "done"] as PromoStatus[]).includes(
    raw as PromoStatus,
  )
    ? (raw as PromoStatus)
    : "all";

  const rows = await listPromos({ status });

  const csv = toCsv(
    [
      "상태", "기관·회사명", "신청자", "직급", "이메일", "연락처",
      "홍보 제목", "홍보 문구", "홍보 내용", "희망일", "주기",
      "그림", "첨부", "접수번호", "신청일",
    ],
    rows.map((r) => [
      PROMO_STATUS_LABEL[r.status],
      r.org,
      r.name,
      r.position,
      r.email,
      r.tel,
      r.subject,
      r.tagline,
      r.body,
      r.startOn,
      CADENCE_LABEL[r.cadence],
      r.imageUrl ? "있음" : "",
      r.file ? r.file.name : "",
      r.ref,
      r.createdAt.slice(0, 10),
    ]),
  );

  return csvResponse("promo-requests", csv);
}
