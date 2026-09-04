"use client";

import { deleteSubscriber, setSubscriberStatus } from "@/lib/db/newsletter-actions";
import type { Subscriber } from "@/lib/db/newsletter";
import { formatDate } from "@/lib/format";

const btn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

export default function SubscriberTable({ subscribers }: { subscribers: Subscriber[] }) {
  if (subscribers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white py-12 text-center text-md text-ink-400">
        구독자가 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface">
            <th className="px-4 py-4 text-base font-bold text-navy-900">이메일</th>
            <th className="w-28 px-4 py-4 text-center text-base font-bold text-navy-900">상태</th>
            <th className="w-32 px-4 py-4 text-center text-base font-bold text-navy-900">
              신청 경로
            </th>
            <th className="w-32 px-4 py-4 text-center text-base font-bold text-navy-900">신청일</th>
            <th className="w-44 px-4 py-4 text-base font-bold text-navy-900">처리</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <tr key={subscriber.id} className="border-b border-line">
              <td className="label-mono px-4 py-4 text-ink-900">{subscriber.email}</td>

              <td className="px-4 py-4 text-center">
                <span
                  className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${
                    subscriber.status === "active"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-surface text-ink-400"
                  }`}
                >
                  {subscriber.status === "active" ? "구독 중" : "해지"}
                </span>
              </td>

              <td className="px-4 py-4 text-center text-base text-ink-400">
                {subscriber.source || "—"}
              </td>
              <td className="label-mono px-4 py-4 text-center tabular-nums text-ink-400">
                {formatDate(subscriber.createdAt)}
              </td>

              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  <form action={setSubscriberStatus}>
                    <input type="hidden" name="id" value={subscriber.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={subscriber.status === "active" ? "unsubscribed" : "active"}
                    />
                    <button type="submit" className={btn}>
                      {subscriber.status === "active" ? "해지 처리" : "구독 복구"}
                    </button>
                  </form>

                  <form
                    action={deleteSubscriber}
                    onSubmit={(e) => {
                      if (!confirm(`${subscriber.email}을(를) 명단에서 지울까요?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={subscriber.id} />
                    <button
                      type="submit"
                      className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
