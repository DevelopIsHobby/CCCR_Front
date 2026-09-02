import type { Metadata } from "next";
import {
  PageHead,
  StatCard,
  btnPrimary,
  inputBox,
  pillClass,
  pillGroup,
} from "@/components/admin/AdminUi";
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
    <div className="space-y-6">
      <PageHead
        title="회원 관리"
        desc="홈페이지 회원가입 신청을 승인하고 권한을 관리합니다. 조합 회원사 가입과는 별개입니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="전체" value={counts.total} unit="명" />
        <StatCard
          label={USER_STATUS_LABEL.pending}
          value={counts.pending}
          unit="명"
          accent={counts.pending > 0}
          note={counts.pending > 0 ? "승인을 기다리는 중" : undefined}
        />
        <StatCard label={USER_STATUS_LABEL.active} value={counts.active} unit="명" />
        <StatCard label={USER_STATUS_LABEL.blocked} value={counts.blocked} unit="명" />
      </div>

      {/* 검색 · 필터 */}
      <form method="get" className="flex flex-wrap items-center gap-3">
        <div className={pillGroup}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="submit"
              name="status"
              value={f.value}
              aria-pressed={status === f.value}
              className={pillClass(status === f.value)}
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
            className={`w-full max-w-xs ${inputBox}`}
          />
          <button type="submit" className={btnPrimary}>
            검색
          </button>
        </div>
      </form>

      {q && (
        <p className="text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {users.length}명
        </p>
      )}

      <MemberTable users={users} />

      <NewAdminForm />
    </div>
  );
}
