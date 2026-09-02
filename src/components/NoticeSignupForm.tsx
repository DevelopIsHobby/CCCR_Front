"use client";

import { useActionState } from "react";
import { signUpForNotices, type NoticeSignupState } from "@/lib/db/outreach-actions";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

/*
  사업공고 수신 신청.
  뉴스레터와 달리 받는 사람이 임원사 담당자로 정해져 있어 회사·담당자를 함께 받는다.
  발송은 모은 명단으로 사무국이 따로 한다.
*/
export default function NoticeSignupForm() {
  const [state, action, pending] = useActionState<NoticeSignupState, FormData>(
    signUpForNotices,
    {},
  );

  return (
    <form action={action} className="mt-8 rounded-2xl bg-surface p-6 lg:p-8">
      {/* 사람은 보지 못하는 칸. 자동 입력을 거르는 데 쓴다. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">회사명</span>
          <input name="company" required placeholder="(주)○○○" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">담당자</span>
          <input name="name" required placeholder="홍길동" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
          <input
            name="email"
            type="email"
            required
            placeholder="name@company.co.kr"
            className={input}
          />
          <span className="mt-1.5 block text-sm text-ink-400">이 주소로 공고를 보내드립니다.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">
            연락처 <span className="font-medium text-ink-400">(선택)</span>
          </span>
          <input name="tel" placeholder="02-0000-0000" className={input} />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="mt-5 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-5 rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
          {state.ok}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm leading-relaxed text-ink-400">
          수집한 정보는 사업공고 발송에만 씁니다. 수신 중단은 사무국으로 연락 주시면 됩니다.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "신청 중…" : "수신 신청"}
        </button>
      </div>
    </form>
  );
}
