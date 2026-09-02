"use client";

import {
  deleteNoticeSubscriber,
  setNoticeSubscriberStatus,
} from "@/lib/db/outreach-actions";
import type { NoticeSubscriber } from "@/lib/outreach-types";
import { formatDate } from "@/lib/format";

const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

export default function NoticeSubscriberTable({
  subscribers,
}: {
  subscribers: NoticeSubscriber[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-y-2 border-navy-900 bg-surface">
            <th className="px-3 py-4 text-base font-bold text-navy-900">회사명</th>
            <th className="w-28 px-3 py-4 text-base font-bold text-navy-900">담당자</th>
            <th className="px-3 py-4 text-base font-bold text-navy-900">이메일</th>
            <th className="w-32 px-3 py-4 text-base font-bold text-navy-900">연락처</th>
            <th className="w-24 px-3 py-4 text-center text-base font-bold text-navy-900">상태</th>
            <th className="w-28 px-3 py-4 text-center text-base font-bold text-navy-900">신청일</th>
            <th className="w-36 px-3 py-4 text-base font-bold text-navy-900">처리</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.length === 0 && (
            <tr className="border-b border-line">
              <td colSpan={7} className="px-3 py-16 text-center text-md text-ink-400">
                신청한 곳이 없습니다.
              </td>
            </tr>
          )}

          {subscribers.map((s) => (
            <tr key={s.id} className="border-b border-line">
              <td className="px-3 py-3 text-md font-bold text-navy-900">{s.company}</td>
              <td className="px-3 py-3 text-base text-ink-700">{s.name}</td>
              <td className="label-mono px-3 py-3 text-ink-600">{s.email}</td>
              <td className="label-mono px-3 py-3 tabular-nums text-ink-400">{s.tel || "-"}</td>

              <td className="px-3 py-3 text-center">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${
                    s.status === "active"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-surface text-ink-400"
                  }`}
                >
                  {s.status === "active" ? "수신 중" : "중단"}
                </span>
              </td>

              <td className="label-mono px-3 py-3 text-center tabular-nums text-ink-400">
                {formatDate(s.createdAt)}
              </td>

              <td className="px-3 py-3">
                <span className="flex items-center gap-1.5">
                  <form action={setNoticeSubscriberStatus}>
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={s.status === "active" ? "unsubscribed" : "active"}
                    />
                    <button type="submit" className={smallBtn}>
                      {s.status === "active" ? "중단" : "재개"}
                    </button>
                  </form>

                  <form
                    action={deleteNoticeSubscriber}
                    onSubmit={(e) => {
                      if (!confirm(`${s.email}을(를) 명단에서 지울까요?`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
                    >
                      삭제
                    </button>
                  </form>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
