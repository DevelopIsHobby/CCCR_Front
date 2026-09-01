"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type SubscribeState } from "@/lib/db/newsletter-actions";
import { IconArrow } from "./Icons";

/*
  뉴스레터 구독 신청 폼.
  메인 하단 띠와 뉴스레터 화면이 함께 쓴다. 색만 다르다.
*/
export default function NewsletterForm({
  source,
  tone = "dark",
}: {
  /** 어디서 신청했는지 기록해 둔다 */
  source: string;
  tone?: "dark" | "light";
}) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(
    subscribeNewsletter,
    {},
  );

  const inputClass =
    tone === "dark"
      ? "min-w-0 rounded-md border border-white/20 bg-white/5 px-4 py-3.5 text-md text-white outline-none transition-colors placeholder:text-brand-100/40 focus:border-flame-500 focus:bg-white/10 sm:w-72"
      : "min-w-0 rounded-md border border-line bg-white px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 sm:w-72";

  return (
    <div className="w-full shrink-0 lg:w-auto">
      <form action={action} className="flex w-full flex-col gap-2 sm:flex-row">
        <input type="hidden" name="source" value={source} />
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          이메일 주소
        </label>
        <input
          id={`newsletter-email-${source}`}
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-flame-500 px-6 py-3.5 text-md font-bold text-white transition-colors hover:bg-flame-600 disabled:opacity-60"
        >
          {pending ? "신청 중…" : "구독 신청"}
          <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {(state.error || state.ok) && (
        <p
          role={state.error ? "alert" : undefined}
          className={`mt-2.5 text-base font-medium ${
            state.error
              ? "text-flame-500"
              : tone === "dark"
                ? "text-brand-100"
                : "text-brand-700"
          }`}
        >
          {state.error ?? state.ok}
        </p>
      )}
    </div>
  );
}
