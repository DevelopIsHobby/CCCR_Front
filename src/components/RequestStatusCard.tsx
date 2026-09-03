import { formatDateTime } from "@/lib/format";
import type { RequestSummary, RequestTone } from "@/lib/db/requests";

/*
  신청 한 건을 보여 주는 카드.
  조회 화면과 목록 화면이 같은 모양을 쓰도록 한 군데로 모았다.
*/

const TONE: Record<RequestTone, string> = {
  wait: "bg-surface text-ink-600 ring-line",
  ok: "bg-brand-50 text-brand-700 ring-brand-200",
  no: "bg-flame-100 text-flame-700 ring-flame-500/30",
};

/* 상태마다 지금 무엇을 기다리는 중인지 한 줄로 알려 준다. */
const HINT: Partial<Record<string, string>> = {
  "승인 대기": "사무국에서 임원사 여부를 확인하고 있습니다. 확인이 끝나면 메일로 알려드립니다.",
  "확정 대기": "사무국에서 일정을 확인하고 있습니다. 확정 전에는 다른 신청이 먼저 잡힐 수 있습니다.",
  접수됨: "사무국이 곧 확인합니다.",
  "검토 중": "담당자가 내용을 살펴보고 있습니다.",
};

export default function RequestStatusCard({ req }: { req: RequestSummary }) {
  const hint = HINT[req.statusLabel];

  return (
    <article className="rounded-xl border border-line bg-white p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="data-line text-ink-400">{req.kindLabel}</p>
          <p className="mt-1 text-lg font-bold text-navy-900">{req.detail || req.kindLabel}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ring-1 ${TONE[req.tone]}`}
        >
          {req.statusLabel}
        </span>
      </div>

      {hint && <p className="mt-3 text-base text-ink-600">{hint}</p>}

      {/* 반려 사유처럼 사무국이 남긴 말은 그대로 보여 준다 */}
      {req.note && (
        <p className="mt-3 rounded-lg bg-flame-100/50 px-4 py-3 text-base leading-relaxed text-ink-700">
          <b className="font-bold text-flame-700">사무국 안내</b>
          <br />
          {req.note}
        </p>
      )}

      <dl className="mt-4 grid gap-x-6 gap-y-1.5 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-400">접수번호</dt>
          <dd className="label-mono font-bold text-navy-900">{req.ref}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-400">신청자</dt>
          <dd className="text-ink-700">{req.name}</dd>
        </div>
        {/* 신청서에 적은 주소. 계정 주소와 다를 수 있어 어디로 안내가 가는지 밝힌다. */}
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-400">안내받을 주소</dt>
          <dd className="min-w-0 break-all text-ink-700">{req.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-400">접수일</dt>
          <dd className="text-ink-700">{formatDateTime(req.createdAt)}</dd>
        </div>
        {req.updatedAt !== req.createdAt && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-ink-400">최근 변경</dt>
            <dd className="text-ink-700">{formatDateTime(req.updatedAt)}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
