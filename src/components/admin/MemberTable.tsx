"use client";

import { deleteUser, setUserRole, setUserStatus } from "@/lib/db/user-actions";
import { USER_STATUS_LABEL, type UserRow } from "@/lib/user-types";
import { formatDate } from "@/lib/format";

const STATUS_TONE: Record<UserRow["status"], string> = {
  pending: "bg-flame-100 text-flame-700",
  active: "bg-brand-50 text-brand-700",
  blocked: "bg-surface text-ink-400",
};

const btn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

function StatusButton({ id, status, label }: { id: number; status: string; label: string }) {
  return (
    <form action={setUserStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={btn}>
        {label}
      </button>
    </form>
  );
}

export default function MemberTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <p className="border-y-2 border-navy-900 py-16 text-center text-md text-ink-400">
        해당하는 회원이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-y-2 border-navy-900 bg-surface">
            <th className="px-4 py-4 text-base font-bold text-navy-900">회원</th>
            <th className="px-4 py-4 text-base font-bold text-navy-900">기관·부서</th>
            <th className="w-28 px-4 py-4 text-center text-base font-bold text-navy-900">상태</th>
            <th className="w-32 px-4 py-4 text-center text-base font-bold text-navy-900">
              가입 신청일
            </th>
            <th className="px-4 py-4 text-base font-bold text-navy-900">처리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-line align-top">
              <td className="px-4 py-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-md font-bold text-navy-900">{user.name}</span>
                  {user.role === "admin" && (
                    <span className="inline-flex rounded bg-navy-900 px-2 py-0.5 text-2xs font-bold text-white">
                      관리자
                    </span>
                  )}
                </p>
                <p className="label-mono mt-1 text-ink-400">{user.email}</p>
                {user.phone && <p className="mt-1 text-base text-ink-600">{user.phone}</p>}
              </td>

              <td className="px-4 py-4 text-base text-ink-600">
                <p>{user.company ?? "—"}</p>
                {user.department && <p className="mt-1 text-ink-400">{user.department}</p>}
              </td>

              <td className="px-4 py-4 text-center">
                <span
                  className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[user.status]}`}
                >
                  {USER_STATUS_LABEL[user.status]}
                </span>
              </td>

              <td className="label-mono px-4 py-4 text-center tabular-nums text-ink-400">
                {formatDate(user.createdAt)}
              </td>

              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {user.status === "pending" && (
                    <>
                      <StatusButton id={user.id} status="active" label="승인" />
                      <StatusButton id={user.id} status="blocked" label="거절" />
                    </>
                  )}
                  {user.status === "active" && (
                    <StatusButton id={user.id} status="blocked" label="이용 정지" />
                  )}
                  {user.status === "blocked" && (
                    <StatusButton id={user.id} status="active" label="정지 해제" />
                  )}

                  <form action={setUserRole}>
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      type="hidden"
                      name="role"
                      value={user.role === "admin" ? "member" : "admin"}
                    />
                    <button type="submit" className={btn}>
                      {user.role === "admin" ? "관리자 해제" : "관리자 지정"}
                    </button>
                  </form>

                  <form
                    action={deleteUser}
                    onSubmit={(e) => {
                      if (!confirm(`${user.name} 회원을 탈퇴 처리할까요? 되돌릴 수 없습니다.`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
                    >
                      탈퇴 처리
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
