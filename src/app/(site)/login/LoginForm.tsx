"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-8 lg:p-10">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-base font-bold text-navy-900">
            이메일
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="login-pw" className="mb-2 block text-base font-bold text-navy-900">
            비밀번호
          </label>
          <input
            id="login-pw"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-5 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
