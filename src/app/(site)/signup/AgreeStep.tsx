"use client";

import Link from "next/link";
import { SocialIcon } from "@/components/SocialIcons";
import AgreementChecks from "@/components/signup/AgreementChecks";
import { SOCIAL_BUTTON, SOCIAL_BUTTON_BASE } from "@/components/social-style";
import { SOCIAL_LABEL, type SocialProvider } from "@/lib/auth/social-profile";
import { MEMBER_TYPE_LABEL, memberTypeSlug, type MemberType } from "@/lib/user-types";

/*
  가입 2단계 — 약관 동의와 가입 방법.

  주소창 방식(GET) 폼이다. 이메일로 가입하면 같은 /signup 으로 동의를 실어 보내
  셋째 단계가 열리고, 소셜 단추는 같은 폼을 로그인 시작 경로(/api/auth/…)로 보낸다
  (formAction). 그쪽이 고른 유형·동의를 쿠키에 적어 두고 다녀온 뒤 가입 화면이 읽는다.

  소셜 단추도 이 폼의 제출 단추라서, 필수 동의를 켜지 않으면 브라우저가 넘어가지
  않는다. 동의 없이 바깥 서비스로 나갔다 돌아와 또 묻는 일이 없다.
*/
export default function AgreeStep({
  memberType,
  providers,
}: {
  memberType: MemberType;
  /** 서버에 키가 들어간 소셜 서비스. 클라이언트는 환경변수를 볼 수 없어 페이지가 넘겨 준다 */
  providers: SocialProvider[];
}) {
  return (
    <form
      method="get"
      action="/signup"
      className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 lg:p-10"
    >
      <input type="hidden" name="type" value={memberTypeSlug(memberType)} />

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-navy-900">약관 동의</h2>
        <p className="text-sm text-ink-400">
          {MEMBER_TYPE_LABEL[memberType]} ·{" "}
          <Link href="/signup" className="text-brand-600 underline underline-offset-2">
            유형 바꾸기
          </Link>
        </p>
      </div>

      <div className="mt-5">
        <AgreementChecks memberType={memberType} />
      </div>

      <button
        type="submit"
        className="mt-8 w-full rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900"
      >
        이메일로 가입하기
      </button>

      {providers.length > 0 && (
        <section aria-label="소셜 계정으로 가입" className="mt-8">
          <p className="flex items-center gap-4 text-sm font-medium text-ink-400 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
            또는 소셜 계정으로 가입
          </p>
          <div className="mt-5 space-y-2.5">
            {providers.map((p) => (
              <button
                key={p}
                type="submit"
                formAction={`/api/auth/${p}`}
                className={`${SOCIAL_BUTTON_BASE} ${SOCIAL_BUTTON[p].button}`}
              >
                <SocialIcon provider={p} className={`absolute left-4 size-5 ${SOCIAL_BUTTON[p].icon}`} />
                {SOCIAL_LABEL[p]}로 가입
              </button>
            ))}
          </div>
        </section>
      )}
    </form>
  );
}
