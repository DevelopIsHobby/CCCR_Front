"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { SocialIcon } from "@/components/SocialIcons";
import AgreementChecks from "@/components/signup/AgreementChecks";
import { SOCIAL_BUTTON, SOCIAL_BUTTON_BASE } from "@/components/social-style";
import { SOCIAL_LABEL, type SocialProvider } from "@/lib/auth/social-profile";
import { MEMBER_TYPE_LABEL, memberTypeSlug, type MemberType } from "@/lib/user-types";

/*
  가입 2단계 — 약관 동의와 가입 방법.

  이메일로 가입하면 주소창 방식(GET) 폼으로 같은 /signup 에 동의를 실어 보내 셋째 단계가 열린다.

  소셜 단추는 폼 제출이 아니라 링크다. 처음에는 같은 폼의 제출 단추(formAction)로 만들었는데,
  사이트 보안 정책(next.config.ts 의 CSP form-action 'self')이 폼 제출이 바깥 사이트로
  넘어가는 것을 막아 카카오 로그인으로 가는 길에서 브라우저가 끊었다. 눌러도 아무 반응이
  없었다. 정책을 풀지 않고, 누르는 순간 고른 유형·동의를 주소에 실어 링크로 보낸다.
  자바스크립트가 없으면 동의 없이 로그인을 시작하고, 그때는 다녀온 뒤 가입 화면이
  유형·동의를 따로 받는다(signup/social).

  필수 동의를 켜지 않고 누르면, 브라우저 기본 경고 대신 단추 바로 위에 알리고 동의 칸으로
  옮겨 준다. 기본 경고는 화면 밖 동의 칸에 떠서 아무 반응이 없는 것처럼 보였다.
*/
export default function AgreeStep({
  memberType,
  providers,
}: {
  memberType: MemberType;
  /** 서버에 키가 들어간 소셜 서비스. 클라이언트는 환경변수를 볼 수 없어 페이지가 넘겨 준다 */
  providers: SocialProvider[];
}) {
  const form = useRef<HTMLFormElement>(null);
  const agreements = useRef<HTMLDivElement>(null);
  const [needAgree, setNeedAgree] = useState(false);

  /* 빠진 동의가 있음을 알리고 그 칸으로 옮긴다 */
  const askAgreement = () => {
    setNeedAgree(true);
    agreements.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    form.current?.querySelector<HTMLInputElement>("input[required]:not(:checked)")?.focus({
      preventScroll: true,
    });
  };

  /*
    누르는 순간 링크 주소에 유형·동의를 실어 두고 기본 이동에 맡긴다.
    클라이언트 라우터(router.push)는 쓰지 않는다. 이 경로는 화면이 아니라
    바깥 로그인으로 넘기는 서버 경로라 브라우저가 통째로 옮겨 가야 한다.
  */
  const startSocial = (provider: SocialProvider) => (e: MouseEvent<HTMLAnchorElement>) => {
    const f = form.current;
    if (!f) return; /* 화면이 아직 준비되지 않았으면 링크 그대로 간다 */
    if (!f.checkValidity()) {
      e.preventDefault();
      askAgreement();
      return;
    }
    const query = new URLSearchParams();
    for (const [key, value] of new FormData(f)) query.append(key, String(value));
    e.currentTarget.href = `/api/auth/${provider}?${query}`;
  };

  return (
    <form
      ref={form}
      method="get"
      action="/signup"
      /* 브라우저 기본 경고는 막고 직접 알린다(위 설명) */
      onInvalidCapture={(e) => {
        e.preventDefault();
        askAgreement();
      }}
      onChange={() => {
        if (needAgree && form.current?.checkValidity()) setNeedAgree(false);
      }}
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

      <div ref={agreements} className="mt-5 scroll-mt-28">
        <AgreementChecks memberType={memberType} />
      </div>

      {needAgree && (
        <p
          role="alert"
          className="mt-8 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700"
        >
          위의 필수 약관(이용약관, 개인정보 수집·이용)에 동의해 주세요.
        </p>
      )}

      <button
        type="submit"
        className={`${needAgree ? "mt-3" : "mt-8"} w-full rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900`}
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
              /* 서버 경로를 거쳐 바깥 서비스로 나가므로 Link 가 아니라 a 로 둔다(SocialLoginButtons 와 같다) */
              <a
                key={p}
                href={`/api/auth/${p}`}
                onClick={startSocial(p)}
                className={`${SOCIAL_BUTTON_BASE} ${SOCIAL_BUTTON[p].button}`}
              >
                <SocialIcon provider={p} className={`absolute left-4 size-5 ${SOCIAL_BUTTON[p].icon}`} />
                {SOCIAL_LABEL[p]}로 가입
              </a>
            ))}
          </div>
        </section>
      )}
    </form>
  );
}
