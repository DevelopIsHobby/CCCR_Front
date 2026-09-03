import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import ResetRequestForm from "@/components/ResetRequestForm";

export const metadata: Metadata = { title: "비밀번호 찾기" };

export default function Page() {
  return (
    <PageShell
      href="/reset"
      title="비밀번호 찾기"
      category="로그인"
      desc="가입하신 이메일로 재설정 링크를 보내드립니다."
    >
      <div className="mx-auto max-w-lg">
        <ResetRequestForm />

        <p className="mt-8 text-center text-base text-ink-600">
          비밀번호가 기억나셨나요?{" "}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
