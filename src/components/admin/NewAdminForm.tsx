"use client";

import { useActionState, useState } from "react";
import { createAdminAccount, type NewAdminState } from "@/lib/db/user-actions";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";

/** 관리자 계정 추가. 서버에서 명령어로 만들지 않아도 되게 한다. */
export default function NewAdminForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<NewAdminState, FormData>(
    createAdminAccount,
    {},
  );

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900">관리자 계정 추가</h2>
          <p className="mt-1.5 text-base text-ink-600">
            새 계정은 바로 관리자 권한으로 만들어집니다. 기존 회원을 관리자로 올리려면 위 목록에서
            관리자 지정을 누르세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          {open ? "닫기" : "+ 계정 추가"}
        </button>
      </div>

      {open && (
        <form action={action} className="mt-6 space-y-4 rounded-xl bg-surface p-6">
          {/* 브라우저가 지금 로그인한 관리자의 정보를 채워 넣지 않도록 자동완성을 끈다 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
              <input name="email" type="email" required autoComplete="off" className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">이름</span>
              <input name="name" type="text" required autoComplete="off" className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">
                비밀번호 (8자 이상)
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={input}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base font-bold text-navy-900">비밀번호 확인</span>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={input}
              />
            </label>
          </div>

          {state.error && (
            <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
              {state.ok}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {pending ? "만드는 중…" : "계정 만들기"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
