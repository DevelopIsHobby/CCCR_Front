"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import LegalDialog, { type LegalTab } from "@/components/LegalDialog";
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

export function SocialSignupDone() {
  return (
    <div className="mx-auto mt-11 max-w-2xl rounded-2xl border border-line bg-white p-10 text-center">
      <p className="text-xl font-bold text-navy-900">가입 신청이 접수되었습니다</p>
      <p className="mt-4 text-md leading-relaxed text-ink-600">
        사무국 확인 후 이용할 수 있습니다. 승인되면 같은 소셜 계정으로 로그인해 주세요.
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
  );
}

export default function SocialSignupForm({
  providerLabel,
  email,
  emailLocked,
  name,
}: {
  providerLabel: string;
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

  if (state.ok) return <SocialSignupDone />;

  return (
    <>
      <form
        action={action}
        className="mx-auto mt-11 max-w-2xl rounded-2xl border border-line bg-white p-8 lg:p-10"
      >
        <p className="rounded-lg bg-brand-50 px-5 py-4 text-base leading-relaxed text-brand-700">
          <b className="font-bold">{providerLabel} 계정</b>으로 가입합니다. 비밀번호는 만들지 않고,
          승인되면 {providerLabel} 로그인으로 들어오시면 됩니다.
        </p>

        <fieldset className="mt-10">
          <legend className="text-lg font-bold text-navy-900">약관 동의</legend>
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
        </fieldset>

        <fieldset className="mt-10">
          <legend className="text-lg font-bold text-navy-900">회원 정보</legend>
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
              <input
                id="social-department"
                name="department"
                autoComplete="organization-title"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="social-email" className="mb-2 block text-base font-bold text-navy-900">
                이메일
              </label>
              {emailLocked ? (
                <>
                  <input id="social-email" value={email} readOnly className={`${input} bg-surface text-ink-600`} />
                  <p className="mt-1.5 text-sm text-ink-400">{providerLabel}에서 확인한 주소입니다.</p>
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

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
          >
            {pending ? "신청 중…" : "가입 신청"}
          </button>
          <Link
            href="/"
            className="rounded-md px-8 py-4 text-center text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
          >
            취소
          </Link>
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
