"use client";

import { useActionState } from "react";
import {
  changeMyName,
  changeMyPassword,
  signOutOtherDevices,
  type AccountState,
} from "@/lib/db/account-actions";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const submitBtn =
  "rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60";

function Result({ state }: { state: AccountState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p className="rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
        {state.ok}
      </p>
    );
  }
  return null;
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(changeMyPassword, {});

  return (
    <form action={action} className="mt-6 space-y-4 rounded-xl bg-surface p-6">
      <label className="block sm:max-w-sm">
        <span className="mb-1.5 block text-base font-bold text-navy-900">현재 비밀번호</span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            새 비밀번호 (8자 이상)
          </span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">새 비밀번호 확인</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={input}
          />
        </label>
      </div>

      <Result state={state} />

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={submitBtn}>
          {pending ? "바꾸는 중…" : "비밀번호 변경"}
        </button>
      </div>
    </form>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(changeMyName, {});

  return (
    <form action={action} className="mt-6 space-y-4 rounded-xl bg-surface p-6">
      <label className="block sm:max-w-sm">
        <span className="mb-1.5 block text-base font-bold text-navy-900">이름</span>
        <input name="name" defaultValue={name} required className={input} />
        <span className="mt-1.5 block text-sm text-ink-400">
          게시글의 글쓴이와 헤더에 이 이름이 나옵니다.
        </span>
      </label>

      <Result state={state} />

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={submitBtn}>
          {pending ? "저장 중…" : "이름 변경"}
        </button>
      </div>
    </form>
  );
}

export function OtherDevicesForm({ count }: { count: number }) {
  /* 지금 기기 하나뿐이면 끊을 것이 없다 */
  if (count <= 1) {
    return (
      <p className="mt-6 rounded-xl bg-surface px-6 py-5 text-base text-ink-600">
        지금 기기에서만 로그인되어 있습니다.
      </p>
    );
  }

  return (
    <form
      action={signOutOtherDevices}
      className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface p-6"
    >
      <p className="text-base text-ink-600">
        <b className="font-bold text-navy-900">{count}대</b>에서 로그인되어 있습니다. 지금 기기만
        남기고 나머지를 끊습니다.
      </p>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("다른 기기의 로그인을 모두 끊을까요?")) e.preventDefault();
        }}
        className="rounded-full px-5 py-2.5 text-base font-bold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
      >
        다른 기기 로그아웃
      </button>
    </form>
  );
}
