"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp, type SignUpState } from "@/lib/auth/signup-actions";
import LegalDialog, { type LegalTab } from "@/components/LegalDialog";

const input =
  "w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors focus:border-brand-500";

const AGREEMENTS: { id: string; label: string; doc: LegalTab | null; required: boolean }[] = [
  { id: "agreeTerms", label: "이용약관 동의", doc: "terms", required: true },
  { id: "agreePrivacy", label: "개인정보 수집·이용 동의", doc: "privacy", required: true },
  { id: "agreeNewsletter", label: "뉴스레터 수신 동의", doc: null, required: false },
];

const FIELDS = [
  { id: "company", label: "기관·회사명", type: "text", full: true, ac: "organization", required: true },
  { id: "name", label: "담당자 이름", type: "text", full: false, ac: "name", required: true },
  { id: "department", label: "부서·직위", type: "text", full: false, ac: "organization-title", required: false },
  { id: "email", label: "이메일 (로그인 아이디)", type: "email", full: false, ac: "email", required: true },
  { id: "phone", label: "연락처", type: "tel", full: false, ac: "tel", required: false },
];

export default function SignUpForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, {});
  /* 전문은 새 페이지로 나가지 않고 팝업으로 본다. 쓰던 입력이 사라지지 않게. */
  const [doc, setDoc] = useState<LegalTab | null>(null);

  if (state.ok) {
    return (
      <div className="mx-auto mt-11 max-w-2xl rounded-2xl border border-line bg-white p-10 text-center">
        <p className="text-xl font-bold text-navy-900">가입 신청이 접수되었습니다</p>
        <p className="mt-4 text-md leading-relaxed text-ink-600">
          사무국 확인 후 이용할 수 있습니다. 승인되면 입력하신 이메일로 로그인해 주세요.
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

  return (
    <>
      <form action={action} className="mx-auto mt-11 max-w-2xl rounded-2xl border border-line bg-white p-8 lg:p-10">
      <fieldset>
        <legend className="text-lg font-bold text-navy-900">약관 동의</legend>
        <div className="mt-5 space-y-3">
          {/* 전문보기는 라벨 밖에 둔다. 라벨 안에 있으면 눌렀을 때 동의 체크가 함께 켜진다. */}
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
          {FIELDS.map((f) => (
            <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
              <label htmlFor={`signup-${f.id}`} className="mb-2 block text-base font-bold text-navy-900">
                {f.label}
                {!f.required && <span className="ml-1.5 text-xs font-medium text-ink-400">선택</span>}
              </label>
              <input
                id={`signup-${f.id}`}
                name={f.id}
                type={f.type}
                autoComplete={f.ac}
                required={f.required}
                className={input}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-bold text-navy-900">비밀번호</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-password" className="mb-2 block text-base font-bold text-navy-900">
              비밀번호 (8자 이상)
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={input}
            />
          </div>
          <div>
            <label
              htmlFor="signup-password-confirm"
              className="mb-2 block text-base font-bold text-navy-900"
            >
              비밀번호 확인
            </label>
            <input
              id="signup-password-confirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={input}
            />
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
