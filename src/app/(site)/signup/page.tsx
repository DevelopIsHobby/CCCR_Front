import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import { StepFlow } from "@/components/sub/Ui";
import SignUpForm from "./SignUpForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "회원가입" };

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
