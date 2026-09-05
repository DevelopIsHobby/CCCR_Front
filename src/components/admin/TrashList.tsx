"use client";

import { purgeItem, restoreItem } from "@/lib/db/trash-actions";
import { TRASH_KEEP_DAYS, TRASH_LABEL, type TrashRow } from "@/lib/trash-types";
import { formatDate } from "@/lib/format";

/** 지운 날로부터 며칠이 지났는지. 남은 날을 알려 주려고 쓴다. */
function daysLeft(deletedAt: string): number {
  const gone = new Date(deletedAt.replace(" ", "T")).getTime();
  const passed = Math.floor((Date.now() - gone) / 86_400_000);
  return Math.max(0, TRASH_KEEP_DAYS - passed);
}

export default function TrashList({ rows }: { rows: TrashRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-line bg-surface px-6 py-16 text-center text-md text-ink-400">
        휴지통이 비어 있습니다.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-y-2 border-navy-900 bg-surface">
            <th className="w-32 px-3 py-4 text-base font-bold text-navy-900">갈래</th>
            <th className="px-3 py-4 text-base font-bold text-navy-900">내용</th>
            <th className="w-36 px-3 py-4 text-base font-bold text-navy-900">있던 곳</th>
            <th className="w-28 px-3 py-4 text-center text-base font-bold text-navy-900">지운 날</th>
            <th className="w-24 px-3 py-4 text-center text-base font-bold text-navy-900">남은 기간</th>
            <th className="w-40 px-3 py-4 text-base font-bold text-navy-900">처리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const left = daysLeft(row.deletedAt);

            return (
              <tr key={`${row.kind}-${row.id}`} className="border-b border-line">
                <td className="px-3 py-3">
                  <span className="inline-flex rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-600">
                    {TRASH_LABEL[row.kind]}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <p className="truncate text-md text-ink-900">{row.title}</p>
                </td>

                <td className="px-3 py-3 text-base text-ink-400">{row.where}</td>

                <td className="label-mono px-3 py-3 text-center tabular-nums text-ink-400">
                  {formatDate(row.deletedAt)}
                </td>

                <td className="px-3 py-3 text-center">
                  <span
                    className={`label-mono tabular-nums ${
                      left <= 7 ? "font-bold text-flame-700" : "text-ink-400"
                    }`}
                  >
                    {left}일
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="flex items-center gap-1.5">
                    <form action={restoreItem}>
                      <input type="hidden" name="kind" value={row.kind} />
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded px-2.5 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
                      >
                        되돌리기
                      </button>
                    </form>

                    <form
                      action={purgeItem}
                      onSubmit={(e) => {
                        if (
                          !confirm(
                            `${row.title}\n\n완전히 지우면 되돌릴 수 없습니다. 계속할까요?`,
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="kind" value={row.kind} />
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
                      >
                        완전 삭제
                      </button>
                    </form>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
