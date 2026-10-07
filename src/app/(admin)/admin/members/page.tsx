import type { Metadata } from "next";
import Link from "next/link";
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
import { countUnclassified, countUsersByStatus, listUsers, type MemberTypeFilter } from "@/lib/db/users";
import { MEMBER_TYPES, USER_STATUS_LABEL, type UserStatus } from "@/lib/user-types";

export const metadata: Metadata = { title: "회원 관리" };

const FILTERS: { value: UserStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: USER_STATUS_LABEL.pending },
  { value: "active", label: USER_STATUS_LABEL.active },
  { value: "blocked", label: USER_STATUS_LABEL.blocked },
];

/* 회원 구분 거르기. '구분 없음'으로 걸러 옛 회원을 차례로 정한다 */
const TYPE_FILTERS: { value: MemberTypeFilter; label: string }[] = [
  { value: "all", label: "구분 전체" },
  ...MEMBER_TYPES.map((t) => ({ value: t, label: t })),
  { value: "none", label: "구분 없음" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | UserStatus
    | "all";
  const type = TYPE_FILTERS.find((f) => f.value === sp.type)?.value ?? "all";

  const [users, counts, unclassified] = await Promise.all([
    listUsers({ q, status, memberType: type }),
    countUsersByStatus(),
    countUnclassified(),
  ]);

  /* 지금 걸어 둔 조건(상태·검색어)을 지키며 구분만 바꾸는 주소 */
  const typeHref = (value: MemberTypeFilter) => {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    if (q) p.set("q", q);
    if (value !== "all") p.set("type", value);
    const qs = p.toString();
    return qs ? `/admin/members?${qs}` : "/admin/members";
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="회원 관리"
        desc="홈페이지 회원가입 신청을 승인하고 권한을 관리합니다. 조합 회원사 가입과는 별개입니다."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

      {unclassified > 0 && type !== "none" && (
        <p className="rounded-xl border border-dashed border-flame-500 bg-white px-5 py-4 text-base text-ink-600">
          회원 구분이 비어 있는 회원이 <b className="font-bold text-flame-700">{unclassified}</b>명 있습니다.
          회원 구분을 받기 전에 가입한 분들입니다.{" "}
          <Link href={typeHref("none")} className="font-semibold text-brand-600 underline underline-offset-2">
            구분 없는 회원만 보기
          </Link>
        </p>
      )}

      {/* 검색 · 필터 */}
      <form method="get" className="flex flex-wrap items-center gap-3">
        {/* 상태를 바꿔도 보던 구분 거르기는 그대로 둔다 */}
        {type !== "all" && <input type="hidden" name="type" value={type} />}
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

      <nav className={pillGroup} aria-label="회원 구분">
        {TYPE_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={typeHref(f.value)}
            aria-current={type === f.value ? "page" : undefined}
            className={pillClass(type === f.value)}
          >
            {f.label}
          </Link>
        ))}
      </nav>

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
