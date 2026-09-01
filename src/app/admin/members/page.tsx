import type { Metadata } from "next";
import MemberTable from "@/components/admin/MemberTable";
import NewAdminForm from "@/components/admin/NewAdminForm";
import { countUsersByStatus, listUsers } from "@/lib/db/users";
import { USER_STATUS_LABEL, type UserStatus } from "@/lib/user-types";

export const metadata: Metadata = { title: "회원 관리" };

const FILTERS: { value: UserStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: USER_STATUS_LABEL.pending },
  { value: "active", label: USER_STATUS_LABEL.active },
  { value: "blocked", label: USER_STATUS_LABEL.blocked },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | UserStatus
    | "all";

  const [users, counts] = await Promise.all([listUsers({ q, status }), countUsersByStatus()]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">회원 관리</h1>
        <p className="mt-2 text-md text-ink-600">
          홈페이지 회원가입 신청을 승인하고 권한을 관리합니다. 조합 회원사 가입과는 별개입니다.
        </p>
      </div>

      {/* 요약 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "전체", value: counts.total },
          { label: USER_STATUS_LABEL.pending, value: counts.pending, accent: counts.pending > 0 },
          { label: USER_STATUS_LABEL.active, value: counts.active },
          { label: USER_STATUS_LABEL.blocked, value: counts.blocked },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-6 ${
              card.accent ? "border-flame-500 bg-flame-100/40" : "border-line bg-surface"
            }`}
          >
            <p className="text-base font-medium text-ink-600">{card.label}</p>
            <p className="label-mono mt-2 text-3xl font-bold tabular-nums leading-none text-navy-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 검색 · 필터 */}
      <form method="get" className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="submit"
              name="status"
              value={f.value}
              aria-pressed={status === f.value}
              className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                status === f.value ? "bg-navy-900 text-white" : "text-ink-600 hover:text-brand-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 justify-end gap-2">
          <label htmlFor="member-q" className="sr-only">
            검색어
          </label>
          <input
            id="member-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="이름 · 이메일 · 기관명"
            className="w-full max-w-xs rounded-md border border-line px-4 py-2.5 text-base outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
          >
            검색
          </button>
        </div>
      </form>

      {q && (
        <p className="mt-4 text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {users.length}명
        </p>
      )}

      <div className="mt-6">
        <MemberTable users={users} />
      </div>

      <NewAdminForm />
    </>
  );
}
