"use client";

import { useActionState } from "react";
import { applyReset, type ResetState } from "@/lib/auth/reset-actions";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3.5 text-md outline-none transition-colors focus:border-brand-500";

/** 링크를 타고 들어와 새 비밀번호를 정한다. */
export default function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(applyReset, {});

  return (
    <form action={action} className="space-y-5 rounded-xl bg-surface p-6 lg:p-8">
      <input type="hidden" name="token" value={token} />

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">
          새 비밀번호 <span className="font-medium text-ink-400">(8자 이상)</span>
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
        <span className="mb-1.5 block text-base font-bold text-navy-900">새 비밀번호 확인</span>
        <input
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={input}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
      >
        {pending ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>

      <p className="text-sm leading-relaxed text-ink-400">
        바꾸시면 다른 기기에 열려 있던 로그인은 모두 끊깁니다.
      </p>
    </form>
  );
}
