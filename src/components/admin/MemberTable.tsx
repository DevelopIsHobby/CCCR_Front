"use client";

import { Fragment } from "react";

import { deleteUser, setUserRole, setUserStatus } from "@/lib/db/user-actions";
import {
  USER_STATUS_LABEL,
  type DuplicateField,
  type DuplicateHint,
  type UserRow,
} from "@/lib/user-types";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { formatBizNumber } from "@/lib/biz-number";
import { SOCIAL_LABEL } from "@/lib/auth/social-profile";

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
      <p className="rounded-xl border border-dashed border-line bg-white py-12 text-center text-md text-ink-400">
        해당하는 회원이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface">
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
            <Fragment key={user.id}>
            <tr className={`align-top ${user.dupes?.length ? "" : "border-b border-line"}`}>
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
                {user.providers && user.providers.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap gap-1">
                    {user.providers.map((provider) => (
                      <span
                        key={provider}
                        className="rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-600"
                      >
                        {SOCIAL_LABEL[provider]} 로그인
                      </span>
                    ))}
                  </p>
                )}
                {user.phone && (
                  <p className="mt-1 text-base text-ink-600">{formatPhone(user.phone)}</p>
                )}
              </td>

              <td className="px-4 py-4 text-base text-ink-600">
                {/*
                  회원 구분. 가입한 사람이 스스로 고른 값이라 회원사 명단과 견주어 승인한다.
                  회원사라고 고른 것은 눈에 띄게 둔다 — 명단에 있는지 먼저 봐야 할 사람이다.
                */}
                {user.memberType && (
                  <span
                    className={`mb-1 inline-flex rounded px-2 py-0.5 text-2xs font-bold ${
                      user.memberType === "회원사" ? "bg-brand-50 text-brand-700" : "bg-surface text-ink-600"
                    }`}
                  >
                    {user.memberType}
                  </span>
                )}
                <p>{user.company ?? "—"}</p>
                {user.department && <p className="mt-1 text-ink-400">{user.department}</p>}
                {user.bizNumber && (
                  <p className="label-mono mt-1 text-ink-400">{formatBizNumber(user.bizNumber)}</p>
                )}
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

            {user.dupes && user.dupes.length > 0 && (
              <tr className="border-b border-line">
                <td colSpan={5} className="px-4 pb-4">
                  <DuplicateNotice hints={user.dupes} />
                </td>
              </tr>
            )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DUPE_LABEL: Record<DuplicateField, string> = {
  name: "이름이 같음",
  bizNumber: "사업자등록번호가 같음",
};

/*
  중복 의심 알림.

  막지 않고 보여 주기만 한다. 같은 회사에 담당자가 둘인 것은 정당하고 동명이인도 있다.
  휴대전화번호가 같은 계정은 가입 때 이미 막으므로 여기 오지 않는다.
  승인을 누르기 전에 눈에 들어와야 뜻이 있어서, 그 줄 바로 아래에 붙인다.
*/
function DuplicateNotice({ hints }: { hints: DuplicateHint[] }) {
  return (
    <div className="rounded-lg bg-flame-50 px-4 py-3 ring-1 ring-flame-500/30">
      <p className="text-sm font-bold text-flame-700">
        이미 있는 계정과 겹칩니다 ({hints.length}건) — 같은 사람인지 확인해 주세요
      </p>
      <ul className="mt-2 space-y-1">
        {hints.map((h) => (
          <li key={h.id} className="text-sm text-ink-600">
            {h.fields.map((f) => (
              <span
                key={f}
                className="mr-1.5 rounded bg-white px-1.5 py-0.5 text-2xs font-bold text-flame-700"
              >
                {DUPE_LABEL[f]}
              </span>
            ))}
            <b className="font-bold text-navy-900">{h.name}</b>
            {h.company && <span className="text-ink-400"> · {h.company}</span>}
            <span className="label-mono ml-1.5 text-ink-400">{h.email}</span>
            <span className="ml-1.5 text-ink-400">
              ({USER_STATUS_LABEL[h.status]} · {formatDate(h.createdAt)} 가입)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
