import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import { StepFlow } from "@/components/sub/Ui";
import SignUpForm from "./SignUpForm";
import { getSession } from "@/lib/auth/session";
import { pageMeta } from "@/lib/page-meta";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export const metadata: Metadata = pageMeta(
  "회원가입",
  "/signup",
  "홈페이지 회원가입 안내. 조합 회원사 가입과는 별개이며, 가입하시면 사무국 승인 후 회원사 전용 자료와 신청 현황을 이용하실 수 있습니다.",
);

const SIGNUP_STEPS = [
  { title: "약관 동의", desc: "이용약관과 개인정보 수집·이용에 동의합니다." },
  { title: "정보 입력", desc: "소속 기관과 담당자 정보를 입력합니다." },
  { title: "사무국 승인", desc: "조합 사무국이 신청 내용을 확인합니다." },
  { title: "가입 완료", desc: "승인되면 입력한 이메일로 로그인할 수 있습니다." },
];

export default async function Page() {
  if (await getSession()) redirect("/");

  return (
    <PageShell
      href="/signup"
      title="회원가입"
      category="회원"
      desc="홈페이지 회원가입은 조합 회원사 가입과 별개입니다."
    >
      <StepFlow steps={SIGNUP_STEPS} />

      {/* 소셜 계정으로 가입하면 비밀번호 없이 들어오고, 소속·동의는 따로 받는다(키가 있는 서비스만 나온다) */}
      <div className="mx-auto max-w-2xl">
        <SocialLoginButtons verb="가입" heading="소셜 계정으로 간편 가입" />
      </div>

      <SignUpForm />

      <p className="mx-auto mt-6 max-w-2xl rounded-lg bg-surface px-5 py-4 text-base leading-relaxed text-ink-600">
        조합 회원사 가입을 원하시면{" "}
        <Link href="/members/join" className="font-bold text-brand-600 hover:underline">
          회원사 가입안내
        </Link>
        를 확인해 주세요.
      </p>
    </PageShell>
  );
}
