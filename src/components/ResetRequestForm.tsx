"use client";

import { useActionState } from "react";
import { requestReset, type ResetRequestState } from "@/lib/auth/reset-actions";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

/** 가입한 주소를 받아 재설정 링크를 보낸다. */
export default function ResetRequestForm() {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestReset, {});

  if (state.ok) {
    return (
      <p className="rounded-xl bg-brand-50 px-6 py-8 text-center text-md font-medium leading-relaxed text-brand-700">
        {state.ok}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-xl bg-surface p-6 lg:p-8">
      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">가입하신 이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.co.kr"
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
        {pending ? "보내는 중…" : "재설정 링크 받기"}
      </button>

      <p className="text-sm leading-relaxed text-ink-400">
        링크는 세 시간 동안만 쓸 수 있습니다. 메일이 오지 않으면 스팸함도 확인해 주세요.
      </p>
    </form>
  );
}
