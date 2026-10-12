"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp, type SignUpState } from "@/lib/auth/signup-actions";
import ScrollToTopOnShow from "@/components/ScrollToTopOnShow";
import { SIGNUP_MAX } from "@/lib/auth/signup-limits";
import PasswordRuleHint from "@/components/PasswordRuleHint";
import { PASSWORD_MIN } from "@/lib/auth/password-rule";
import ProfileFields, { fieldInput } from "@/components/signup/ProfileFields";
import { MEMBER_TYPE_LABEL, memberTypeSlug, type MemberType } from "@/lib/user-types";

/*
  가입 3단계 — 정보 입력(이메일 가입).

  앞 단계에서 고른 회원 유형과 약관 동의는 숨은 칸으로 함께 보낸다. 서버는 이 값을
  다시 확인한다(signup-actions.ts). 주소를 고쳐 이 화면에 바로 와도 동의가 없으면
  페이지가 둘째 단계로 돌려보내고, 요청을 직접 만들어 보내도 서버가 막는다.
*/
export function SignupDone() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-10 text-center">
      <ScrollToTopOnShow />
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

export default function SignUpForm({
  memberType,
  newsletter,
}: {
  memberType: MemberType;
  newsletter: boolean;
}) {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, {});
  /* 입력하는 동안 비밀번호 규칙을 맞췄는지 보여 주려고 값을 들고 있는다 */
  const [password, setPassword] = useState("");

  if (state.ok) return <SignupDone />;

  /* 약관 동의 단계로 돌아가는 주소. 고른 유형은 그대로 둔다 */
  const back = `/signup?type=${memberTypeSlug(memberType)}`;

  return (
    <form action={action} className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 lg:p-10">
      <input type="hidden" name="memberType" value={memberType} />
      <input type="hidden" name="agreeTerms" value="on" />
      <input type="hidden" name="agreePrivacy" value="on" />
      {newsletter && <input type="hidden" name="agreeNewsletter" value="on" />}

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface px-4 py-3 text-sm text-ink-600">
        <span>
          <b className="font-bold text-navy-900">{MEMBER_TYPE_LABEL[memberType]}</b>
        </span>
        <span aria-hidden className="text-line">|</span>
        <span>약관 동의 완료{newsletter ? " · 뉴스레터 받음" : ""}</span>
        <Link href={back} className="ml-auto text-brand-600 underline underline-offset-2">
          동의 다시 보기
        </Link>
      </p>

      <fieldset className="mt-8">
        <legend className="text-lg font-bold text-navy-900">회원 정보</legend>
        <div className="mt-5">
          <ProfileFields
            memberType={memberType}
            idPrefix="signup"
            email={
              <div>
                <label htmlFor="signup-email" className="mb-2 block text-base font-bold text-navy-900">
                  이메일 <span className="text-sm font-medium text-ink-400">(로그인 아이디)</span>
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={SIGNUP_MAX.email}
                  className={fieldInput}
                />
              </div>
            }
          />
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-bold text-navy-900">비밀번호</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-password" className="mb-2 block text-base font-bold text-navy-900">
              비밀번호
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={PASSWORD_MIN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="signup-password-rule"
              className={fieldInput}
            />
            <div id="signup-password-rule">
              <PasswordRuleHint value={password} />
            </div>
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
              minLength={PASSWORD_MIN}
              className={fieldInput}
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
      <p className="mt-3 text-center text-sm text-ink-400">
        신청하시면 사무국 확인을 거쳐 이용하실 수 있습니다.
      </p>
    </form>
  );
}
