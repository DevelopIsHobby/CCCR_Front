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

      {/*
        기본은 하루면 풀린다. 개인 기기에서 매번 다시 넣기 번거로운 분을 위해 둔다.
        관리자 계정은 골라도 여덟 시간이다(session.ts).
      */}
      <label className="mt-5 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="remember"
          value="1"
          className="mt-0.5 size-4 shrink-0 accent-brand-600"
        />
        <span className="text-base leading-relaxed text-ink-600">
          로그인 유지
          <span className="ml-1.5 text-sm text-ink-400">
            여러 사람이 쓰는 컴퓨터에서는 켜지 마세요
          </span>
        </span>
      </label>

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
