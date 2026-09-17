import type { Metadata } from "next";
import Link from "next/link";
import {
  Empty,
  Note,
  PageHead,
  btnPrimary,
  inputBox,
  pillClass,
  pillGroup,
} from "@/components/admin/AdminUi";
import { Pagination } from "@/components/sub/Ui";
import { formatDateTime, today } from "@/lib/format";
import {
  ADMIN_ACTIONS,
  INSPECTION_DUE_DAYS,
  inspectionOverdue,
  lastInspection,
  listAdminAccess,
} from "@/lib/db/admin-access";
import { markInspected } from "@/lib/db/admin-access-actions";

export const metadata: Metadata = { title: "관리자 접속 기록" };

const TONE: Record<string, string> = {
  조회: "bg-surface text-ink-600",
  처리: "bg-brand-50 text-brand-700",
  내려받기: "bg-flame-100 text-flame-700",
  점검: "bg-navy-900 text-white",
};

/*
  관리자 접속 기록.

  「개인정보의 안전성 확보조치 기준」 제8조: 관리자가 개인정보처리시스템에 접속한 기록을
  1년 이상 보관하고 월 1회 이상 점검해야 한다. 점검은 이 화면에서 한 달치를 훑어보고
  '점검 완료'를 누르는 것으로 한다. 누른 기록도 여기에 남아 점검했다는 근거가 된다.

  살펴볼 것: 모르는 계정이나 낯선 IP, 업무 시간이 아닌 때의 접속,
  평소보다 많은 명단 내려받기, 까닭을 모르는 회원 삭제·권한 변경.
*/
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; action?: string; page?: string }>;
}) {
  const sp = await searchParams;
  /* 기본은 이번 달(한국 날짜) */
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? (sp.month as string) : today().slice(0, 7);
  const action = ADMIN_ACTIONS.includes(sp.action as never) ? (sp.action as string) : "";

  const [{ rows, total, page, totalPages }, last] = await Promise.all([
    listAdminAccess({ month, action, page: Number(sp.page) || 1 }),
    lastInspection(),
  ]);
  const overdue = inspectionOverdue(last);

  const monthHref = (m: string, a = action) => {
    const p = new URLSearchParams({ month: m });
    if (a) p.set("action", a);
    return `/admin/access-log?${p}`;
  };
  const [y, mo] = month.split("-").map(Number);
  const prev = `${mo === 1 ? y - 1 : y}-${String(mo === 1 ? 12 : mo - 1).padStart(2, "0")}`;
  const next = `${mo === 12 ? y + 1 : y}-${String(mo === 12 ? 1 : mo + 1).padStart(2, "0")}`;
  const isThisMonth = month === today().slice(0, 7);

  return (
    <div className="space-y-6">
      <PageHead
        title="관리자 접속 기록"
        desc="관리자가 회원 정보와 신청 기록을 보고, 바꾸고, 내려받은 기록입니다. 법령에 따라 2년 동안 보관하며, 한 달에 한 번 이상 살펴본 뒤 '점검 완료'를 눌러 주세요."
      />

      <section
        className={`rounded-xl border px-5 py-5 lg:px-6 ${
          overdue ? "border-flame-500 bg-flame-100/40" : "border-line bg-white"
        }`}
        aria-labelledby="inspection-title"
      >
        <h2 id="inspection-title" className="text-lg font-bold text-navy-900">
          월간 점검
        </h2>
        <p className="mt-2 text-base text-ink-600">
          {last ? (
            <>
              마지막 점검 <b className="font-bold text-navy-900">{formatDateTime(last.createdAt)}</b> ·{" "}
              {last.email}
              {last.target !== "월간 점검" && <> · {last.target.replace(/^월간 점검 — /, "")}</>}
            </>
          ) : (
            "아직 점검한 기록이 없습니다."
          )}
        </p>
        {overdue && (
          <p className="mt-1 text-base font-semibold text-flame-700">
            점검한 지 {INSPECTION_DUE_DAYS}일이 넘었습니다. 아래 기록을 살펴본 뒤 점검 완료를 눌러 주세요.
          </p>
        )}
        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-ink-600">
          <li>모르는 계정이나 낯선 IP에서 들어온 기록이 있는지</li>
          <li>업무 시간이 아닌 때(밤·휴일)에 접속한 기록이 있는지</li>
          <li>명단 내려받기가 평소보다 많지 않은지</li>
          <li>까닭을 모르는 회원 삭제·권한 변경이 있는지</li>
        </ul>
        <form action={markInspected} className="mt-4 flex flex-wrap gap-2">
          <label htmlFor="inspection-note" className="sr-only">
            점검 메모
          </label>
          <input
            id="inspection-note"
            name="note"
            maxLength={200}
            placeholder="메모 (선택) 예: 9월분 이상 없음"
            className={`w-full max-w-md ${inputBox}`}
          />
          <button type="submit" className={btnPrimary}>
            점검 완료
          </button>
        </form>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={monthHref(prev)} className="rounded-lg border border-line bg-white px-3 py-2 text-base text-ink-600 hover:text-brand-600">
            ← 이전 달
          </Link>
          <span className="label-mono px-2 text-lg font-bold tabular-nums text-navy-900">{month}</span>
          {!isThisMonth && (
            <Link href={monthHref(next)} className="rounded-lg border border-line bg-white px-3 py-2 text-base text-ink-600 hover:text-brand-600">
              다음 달 →
            </Link>
          )}
        </div>

        <nav className={pillGroup} aria-label="기록 종류">
          <Link href={monthHref(month, "")} className={pillClass(!action)}>
            전체
          </Link>
          {ADMIN_ACTIONS.map((a) => (
            <Link key={a} href={monthHref(month, a)} className={pillClass(action === a)}>
              {a}
            </Link>
          ))}
        </nav>
      </div>

      <p className="text-base text-ink-600">
        {month} {action || "전체"} 기록 <b className="font-bold tabular-nums text-navy-900">{total}</b>건
      </p>

      {rows.length === 0 ? (
        <Empty>이 달에 남은 기록이 없습니다.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="w-44 px-4 py-4 text-base font-bold text-navy-900">때</th>
                <th className="w-56 px-4 py-4 text-base font-bold text-navy-900">계정</th>
                <th className="w-36 px-4 py-4 text-base font-bold text-navy-900">IP</th>
                <th className="w-24 px-4 py-4 text-center text-base font-bold text-navy-900">종류</th>
                <th className="px-4 py-4 text-base font-bold text-navy-900">한 일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line align-top last:border-0">
                  <td className="label-mono px-4 py-3 text-sm text-ink-600">{formatDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3 text-base text-navy-900">{row.email}</td>
                  <td className="label-mono px-4 py-3 text-sm text-ink-600">{row.ip || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${TONE[row.action] ?? TONE.조회}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="break-all px-4 py-3 text-base text-ink-700">{row.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/access-log"
        page={page}
        totalPages={totalPages}
        params={{ month, action: action || undefined }}
      />

      <Note>
        이 기록은 2년이 지나면 자동으로 지워집니다. 기록 자체는 고치거나 지울 수 없습니다.
      </Note>
    </div>
  );
}
