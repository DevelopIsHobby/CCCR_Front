import Link from "next/link";
import { IconArrow, IconBusiness, IconMember } from "@/components/Icons";
import { MEMBER_TYPE_HINT, MEMBER_TYPE_LABEL, memberTypeSlug, type MemberType } from "@/lib/user-types";

/*
  가입 1단계 — 회원 유형 고르기.

  개인·기업은 다음 단계(약관 동의)로 간다. '회원사 가입'은 기관이 새로 조합에 가입하는
  것이라 온라인 절차가 없고 회원사 가입안내로 보낸다. 사람의 유형이 아니라는 것이
  보이도록 모양을 달리한다.
*/
function IconBuilding({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 11h.01M15 11h.01" />
    </svg>
  );
}

const ICON: Record<MemberType, typeof IconMember> = { 개인: IconMember, 기업: IconBusiness };

const card =
  "group flex flex-col rounded-2xl border p-6 sm:p-7 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export default function TypeStep() {
  return (
    <>
      <h2 className="text-center text-xl font-bold text-navy-900 lg:text-2xl">
        어떤 회원으로 가입하시나요?
      </h2>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
        {(["개인", "기업"] as const).map((t) => {
          const Icon = ICON[t];
          return (
            <Link
              key={t}
              href={`/signup?type=${memberTypeSlug(t)}`}
              className={`${card} border-line bg-white hover:border-brand-500 hover:shadow-lg`}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-6" />
              </span>
              <span className="mt-4 text-lg font-bold text-navy-900 sm:mt-5">{MEMBER_TYPE_LABEL[t]}</span>
              <span className="mt-2 flex-1 text-base leading-relaxed text-ink-600">
                {MEMBER_TYPE_HINT[t]}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-base font-bold sm:mt-6 text-brand-600">
                가입하기
                <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}

        <Link
          href="/members/join"
          className={`${card} border-dashed border-line bg-surface hover:border-navy-900 hover:shadow-lg`}
        >
          <span className="grid size-12 place-items-center rounded-xl bg-white text-navy-900 ring-1 ring-line">
            <IconBuilding className="size-6" />
          </span>
          <span className="mt-4 text-lg font-bold text-navy-900 sm:mt-5">회원사 가입</span>
          <span className="mt-2 flex-1 text-base leading-relaxed text-ink-600">
            기관·기업이 조합에 새로 가입하려는 경우. 가입 절차와 서류를 안내합니다.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-base font-bold sm:mt-6 text-navy-900">
            회원사 가입안내
            <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-base text-ink-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-brand-600 hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}
