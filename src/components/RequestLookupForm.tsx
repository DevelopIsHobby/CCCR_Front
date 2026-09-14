"use client";

import { useActionState } from "react";
import { lookupRequest, type LookupState } from "@/lib/db/request-actions";

/*
  접수번호로 신청을 찾는 칸.
  로그인하지 않은 사람이 자기 신청을 확인하는 유일한 길이라, 접수 확인 메일에
  적힌 두 가지(접수번호·이메일)만 있으면 되게 한다.

  찾으면 그 신청의 주소로 넘어간다. 여기서 결과를 그리면 뒤로 갔다 왔을 때
  사라져 버리고, 다시 볼 방법이 없다.
*/

const input =
  "w-full rounded-lg border border-line px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

export default function RequestLookupForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookupRequest, {});

  return (
    <>
      <form action={action} className="rounded-xl border border-line bg-surface p-5 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-base font-bold text-navy-900">접수번호</span>
            <input
              name="ref"
              required
              placeholder="예) RM-260903-0042"
              autoComplete="off"
              className={input}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              placeholder="신청할 때 적으신 주소"
              autoComplete="email"
              className={input}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {pending ? "찾는 중…" : "조회하기"}
          </button>
          <p className="text-sm text-ink-400">
            접수 확인 메일에 접수번호가 적혀 있습니다.
          </p>
        </div>

        {state.error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-flame-100 px-4 py-3 text-base leading-relaxed text-flame-700"
          >
            {state.error}
          </p>
        )}
      </form>
    </>
  );
}
