import { getSession } from "@/lib/auth/session";
import { listProposals } from "@/lib/db/outreach";
import { csvResponse, toCsv } from "@/lib/csv";
import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from "@/lib/outreach-types";

/*
  교육사업 제안 내려받기(CSV).
  제안 내용은 줄바꿈이 섞여 있으나 따옴표로 감싸면 엑셀이 한 칸으로 읽는다.
*/
export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("status");
  const status = (["new", "reading", "done"] as ProposalStatus[]).includes(raw as ProposalStatus)
    ? (raw as ProposalStatus)
    : "all";

  const rows = await listProposals({ status });

  const csv = toCsv(
    ["상태", "기관·기업명", "담당자", "이메일", "연락처", "제안 제목", "제안 내용", "접수번호", "신청일"],
    rows.map((r) => [
      PROPOSAL_STATUS_LABEL[r.status],
      r.org,
      r.name,
      r.email,
      r.tel,
      r.subject,
      r.body,
      r.ref,
      r.createdAt.slice(0, 10),
    ]),
  );

  return csvResponse("education-proposals", csv);
}
