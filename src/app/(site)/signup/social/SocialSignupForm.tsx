"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import LegalDialog, { type LegalTab } from "@/components/LegalDialog";
import ScrollToTopOnShow from "@/components/ScrollToTopOnShow";
import { SocialIcon } from "@/components/SocialIcons";
import { SOCIAL_LABEL, type SocialProvider } from "@/lib/auth/social-profile";
import SignupPrivacyNotice from "@/components/SignupPrivacyNotice";
import {
  completeSocialSignup,
  type SocialSignUpState,
} from "@/lib/auth/social-signup-actions";

const input =
  "w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors focus:border-brand-500";

/* 이메일 가입(SignUpForm)과 같은 동의 항목 */
const AGREEMENTS: { id: string; label: string; doc: LegalTab | null; required: boolean }[] = [
  { id: "agreeTerms", label: "이용약관 동의", doc: "terms", required: true },
  { id: "agreePrivacy", label: "개인정보 수집·이용 동의", doc: "privacy", required: true },
  { id: "agreeNewsletter", label: "뉴스레터 수신 동의", doc: null, required: false },
];

const BADGE: Record<SocialProvider, string> = {
  kakao: "bg-[#FEE500] text-black",
  naver: "bg-[#03C75A] text-white",
  google: "bg-white ring-1 ring-[#DADCE0]",
};

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/*
  가입까지 어디쯤인지. 소셜 로그인만 하고 '로그인이 안 된다'고 여기지 않도록
  로그인은 끝났고 지금은 정보를 적는 단계라는 것을 맨 위에서 보여 준다.
*/
function SignupProgress({ provider, current }: { provider: SocialProvider; current: 2 | 3 }) {
  const steps = [`${SOCIAL_LABEL[provider]} 로그인`, "정보 입력", "사무국 승인"];

  return (
    <ol className="mx-auto mt-11 flex max-w-2xl items-start" aria-label="가입 진행 단계">
      {steps.map((title, i) => {
        const step = i + 1;
        const done = step < current;
        const now = step === current;
        return (
          <li key={title} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? "invisible" : done || now ? "bg-brand-600" : "bg-line"}`} />
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-bold ${
                  done
                    ? "bg-brand-600 text-white"
                    : now
                      ? "bg-white text-brand-600 ring-2 ring-brand-600"
                      : "bg-surface text-ink-400 ring-1 ring-line"
                }`}
                aria-current={now ? "step" : undefined}
              >
                {done ? <IconCheck className="size-4" /> : step}
              </span>
              <span className={`h-0.5 flex-1 ${i === steps.length - 1 ? "invisible" : done ? "bg-brand-600" : "bg-line"}`} />
            </div>
            <span className={`mt-2.5 text-sm font-bold ${now ? "text-brand-600" : done ? "text-navy-900" : "text-ink-400"}`}>
              {title}
            </span>
            <span className="mt-0.5 text-xs text-ink-400">{done ? "완료" : now ? "지금 단계" : "다음 단계"}</span>
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <legend className="flex items-center gap-3 text-lg font-bold text-navy-900">
      <span className="grid size-7 place-items-center rounded-full bg-navy-900 text-sm text-white">{n}</span>
      {children}
    </legend>
  );
}

export function SocialSignupDone({ provider }: { provider: SocialProvider }) {
  const label = SOCIAL_LABEL[provider];
  return (
    <>
      <ScrollToTopOnShow />
      <SignupProgress provider={provider} current={3} />
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-white p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <IconCheck className="size-7" />
        </span>
        <p className="mt-5 text-xl font-bold text-navy-900">가입 신청이 접수되었습니다</p>
        <p className="mt-4 text-md leading-relaxed text-ink-600">
          사무국이 확인한 뒤 승인해 드립니다. 승인되면 {label}로 로그인하시면 바로 들어오실 수 있습니다.
          <br />
          문의는 02-2052-0156 또는 admin@cccr.or.kr 로 연락 주시기 바랍니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-navy-900 px-7 py-3 text-md font-bold text-white transition-colors hover:bg-brand-600"
        >
          홈으로
        </Link>
      </div>
    </>
  );
}

export default function SocialSignupForm({
  provider,
  email,
  emailLocked,
  name,
}: {
  provider: SocialProvider;
  email: string;
  /** 서비스가 확인해 준 이메일이면 고칠 수 없게 보여만 준다 */
  emailLocked: boolean;
  name: string;
}) {
  const [state, action, pending] = useActionState<SocialSignUpState, FormData>(
    completeSocialSignup,
    {},
  );
  const [doc, setDoc] = useState<LegalTab | null>(null);
  const label = SOCIAL_LABEL[provider];

  if (state.ok) return <SocialSignupDone provider={provider} />;

  return (
    <>
      <SignupProgress provider={provider} current={2} />

      {/* 로그인은 끝났지만 가입은 아직이라는 것을 가장 먼저 읽히게 */}
      <div className="mx-auto mt-10 flex max-w-2xl gap-4 rounded-2xl bg-navy-900 p-6 text-white lg:p-7">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full ${BADGE[provider]}`}>
          <SocialIcon provider={provider} className="size-5" />
        </span>
        <div>
          <p className="text-lg font-bold">{label} 로그인이 확인되었습니다</p>
          <p className="mt-2 text-base leading-relaxed text-brand-100/80">
            아직 가입이 끝나지 않았습니다. 아래 <b className="font-bold text-white">약관 동의</b>와{" "}
            <b className="font-bold text-white">회원 정보</b>를 마저 작성하고 맨 아래{" "}
            <b className="font-bold text-white">[가입 신청하기]</b>를 눌러 주세요. 사무국이 승인하면
            다음부터 {label}로 바로 로그인됩니다.
          </p>
          <a
            href="#social-signup-form"
            className="mt-4 inline-flex items-center gap-1.5 text-base font-bold text-flame-500 hover:underline"
          >
            아래 작성하러 가기 <span aria-hidden>↓</span>
          </a>
        </div>
      </div>

      <form
        id="social-signup-form"
        action={action}
        className="mx-auto mt-6 max-w-2xl scroll-mt-28 rounded-2xl border border-line bg-white p-8 lg:p-10"
      >
        <fieldset>
          <SectionTitle n={1}>약관 동의</SectionTitle>
          <div className="mt-5 space-y-3">
            {AGREEMENTS.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg bg-surface px-5 py-4 text-md text-ink-700"
              >
                <label className="flex flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    name={t.id}
                    required={t.required}
                    className="size-4 shrink-0 rounded border-line accent-brand-600"
                  />
                  <span>
                    {t.label}
                    <span
                      className={`ml-2 text-xs font-bold ${t.required ? "text-flame-600" : "text-ink-400"}`}
                    >
                      {t.required ? "필수" : "선택"}
                    </span>
                  </span>
                </label>
                {t.doc && (
                  <button
                    type="button"
                    onClick={() => setDoc(t.doc)}
                    className="shrink-0 text-sm text-brand-600 underline underline-offset-2"
                  >
                    전문보기
                  </button>
                )}
              </div>
            ))}
          </div>
          <SignupPrivacyNotice social />
        </fieldset>

        <fieldset className="mt-11">
          <SectionTitle n={2}>회원 정보</SectionTitle>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="social-company" className="mb-2 block text-base font-bold text-navy-900">
                기관·회사명
              </label>
              <input id="social-company" name="company" autoComplete="organization" required className={input} />
            </div>
            <div>
              <label htmlFor="social-name" className="mb-2 block text-base font-bold text-navy-900">
                담당자 이름
              </label>
              <input
                id="social-name"
                name="name"
                autoComplete="name"
                required
                defaultValue={name}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="social-department" className="mb-2 block text-base font-bold text-navy-900">
                부서·직위
                <span className="ml-1.5 text-xs font-medium text-ink-400">선택</span>
              </label>
              <input id="social-department" name="department" autoComplete="organization-title" className={input} />
            </div>
            <div>
              <label htmlFor="social-email" className="mb-2 block text-base font-bold text-navy-900">
                이메일
              </label>
              {emailLocked ? (
                <>
                  <input id="social-email" value={email} readOnly className={`${input} bg-surface text-ink-600`} />
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-ink-400">
                    <IconCheck className="size-3.5 text-brand-600" />
                    {label}에서 확인한 주소입니다
                  </p>
                </>
              ) : (
                <input
                  id="social-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={email}
                  className={input}
                />
              )}
            </div>
            <div>
              <label htmlFor="social-phone" className="mb-2 block text-base font-bold text-navy-900">
                연락처
                <span className="ml-1.5 text-xs font-medium text-ink-400">선택</span>
              </label>
              <input id="social-phone" name="phone" type="tel" autoComplete="tel" className={input} />
            </div>
          </div>
        </fieldset>

        {state.error && (
          <p
            role="alert"
            className="mt-8 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700"
          >
            {state.error}
          </p>
        )}

        <div className="mt-11 border-t border-line pt-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
            >
              {pending ? "신청 중…" : "가입 신청하기"}
            </button>
            <Link
              href="/"
              className="rounded-md px-8 py-4 text-center text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
            >
              취소
            </Link>
          </div>
          <p className="mt-3 text-center text-sm text-ink-400">
            신청하시면 사무국에 승인 요청이 전달됩니다.
          </p>
        </div>
      </form>

      <LegalDialog
        open={doc !== null}
        tab={doc ?? "terms"}
        tabs={["terms", "privacy"]}
        onTabChange={setDoc}
        onClose={() => setDoc(null)}
      />
    </>
  );
}
