import type { Metadata } from "next";
import Link from "next/link";
import {
  Empty,
  Note,
  PageHead,
  StatCard,
  btnGhost,
  btnPrimary,
  inputBox,
} from "@/components/admin/AdminUi";
import { Pagination } from "@/components/sub/Ui";
import { formatDateTime } from "@/lib/format";
import {
  countMailByStatus,
  listMailLog,
  MAIL_KIND_LABEL,
  MAIL_STATUS_LABEL,
  type MailLogRow,
} from "@/lib/db/mail-log";

export const metadata: Metadata = { title: "알림 메일 기록" };

const TONE: Record<MailLogRow["status"], string> = {
  sent: "bg-brand-50 text-brand-700",
  failed: "bg-flame-100 text-flame-700",
  skipped: "bg-surface text-ink-400",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const [{ rows, total, page, totalPages }, counts] = await Promise.all([
    listMailLog({ q, page: Number(sp.page) || 1 }),
    countMailByStatus(),
  ]);

  return (
    <div className="space-y-6">
      <PageHead
        title="알림 메일 기록"
        desc="신청자에게 보낸 접수 확인·결과 안내 메일입니다. 메일을 못 받았다는 문의가 오면 여기서 확인하세요. 본문은 남기지 않습니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="전체" value={counts.total} unit="통" />
        <StatCard label={MAIL_STATUS_LABEL.sent} value={counts.sent} unit="통" />
        <StatCard
          label={MAIL_STATUS_LABEL.failed}
          value={counts.failed}
          unit="통"
          accent={counts.failed > 0}
          note={counts.failed > 0 ? "보내지 못한 메일이 있습니다" : undefined}
        />
        <StatCard
          label={MAIL_STATUS_LABEL.skipped}
          value={counts.skipped}
          unit="통"
          note="발송 설정 없음"
        />
      </div>

      {counts.skipped > 0 && counts.sent === 0 && (
        <Note>
          아직 메일이 한 통도 나가지 않았습니다. 발송 서버 설정(<code>SMTP_HOST</code>,{" "}
          <code>SMTP_USER</code>, <code>SMTP_PASS</code>)이 없으면 메일을 보내지 않고 기록만
          남깁니다. 설정을 넣으면 그때부터 실제로 발송됩니다.
        </Note>
      )}

      <form method="get" className="flex flex-wrap gap-2">
        <label htmlFor="mail-q" className="sr-only">
          검색어
        </label>
        <input
          id="mail-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="접수번호 또는 받는 사람 이메일"
          className={`w-full max-w-sm ${inputBox}`}
        />
        <button type="submit" className={btnPrimary}>
          검색
        </button>
        {q && (
          <Link href="/admin/mail" className={btnGhost}>
            검색 해제
          </Link>
        )}
      </form>

      {q && (
        <p className="text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {total}건
        </p>
      )}

      {rows.length === 0 ? (
        <Empty>{q ? "검색 결과가 없습니다." : "아직 보낸 메일이 없습니다."}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="w-44 px-4 py-4 text-base font-bold text-navy-900">보낸 때</th>
                <th className="w-52 px-4 py-4 text-base font-bold text-navy-900">종류</th>
                <th className="w-36 px-4 py-4 text-base font-bold text-navy-900">접수번호</th>
                <th className="px-4 py-4 text-base font-bold text-navy-900">받는 사람</th>
                <th className="w-24 px-4 py-4 text-center text-base font-bold text-navy-900">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line align-top last:border-0">
                  <td className="label-mono px-4 py-3.5 text-sm text-ink-600">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-base text-ink-700">
                    {MAIL_KIND_LABEL[row.kind] ?? row.kind}
                  </td>
                  <td className="label-mono px-4 py-3.5 text-sm text-navy-900">{row.ref || "—"}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-base text-navy-900">{row.toEmail}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-400">{row.subject}</p>
                    {row.error && (
                      <p className="mt-1 text-sm text-flame-700">{row.error}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${TONE[row.status]}`}
                    >
                      {MAIL_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/admin/mail" page={page} totalPages={totalPages} q={q} />
    </div>
  );
}
