import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import LoginForm from "./LoginForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "로그인" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  if (await getSession()) redirect("/");

  const { next, reset } = await searchParams;
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <PageShell
      href="/login"
      title="로그인"
      category="회원"
      desc="회원사 전용 자료와 교육 신청은 로그인 후 이용할 수 있습니다."
    >
      <div className="mx-auto max-w-md">
        {/* 비밀번호를 바꾸고 돌아온 사람에게는 그렇다고 알려 준다 */}
        {reset === "1" && (
          <p className="mb-6 rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
            비밀번호를 바꿨습니다. 새 비밀번호로 로그인해 주세요.
          </p>
        )}

        <LoginForm next={target} />

        <p className="mt-4 text-center text-base text-ink-600">
          비밀번호를 잊으셨나요?{" "}
          <Link href="/reset" className="font-bold text-brand-600 hover:underline">
            비밀번호 찾기
          </Link>
        </p>

        <div className="mt-6 rounded-xl bg-surface p-7 text-center">
          <p className="text-md font-bold text-navy-900">아직 회원이 아니신가요?</p>
          <p className="mt-2 text-base text-ink-600">
            회원가입 후 조합의 자료와 교육 신청을 이용하실 수 있습니다.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            회원가입
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
