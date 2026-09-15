import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import SocialSignupForm, { SocialSignupDone } from "./SocialSignupForm";
import { getSession } from "@/lib/auth/session";
import { SOCIAL_LABEL } from "@/lib/auth/social-profile";
import { getPendingSocialSignup } from "@/lib/auth/social-signup";

/* 소셜 로그인에서 처음 온 사람만 들어오는 화면이라 검색에서 뺀다 */
export const metadata: Metadata = {
  title: "소셜 계정으로 가입",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (await getSession()) redirect("/");

  const pending = await getPendingSocialSignup();

  return (
    <PageShell
      href="/signup"
      title="회원가입"
      category="회원"
      desc={
        pending
          ? `${SOCIAL_LABEL[pending.provider]} 계정으로 가입합니다. 정보를 마저 작성하고 신청하시면 사무국 승인 후 이용하실 수 있습니다.`
          : "소셜 계정으로 가입합니다."
      }
    >
      {!pending ? (
        <div className="mx-auto mt-11 max-w-2xl rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-xl font-bold text-navy-900">가입할 수 있는 시간이 지났습니다</p>
          <p className="mt-4 text-md leading-relaxed text-ink-600">
            소셜 로그인 후 30분 안에 가입 신청을 마쳐야 합니다. 로그인 화면에서 다시 시작해 주세요.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-full bg-navy-900 px-7 py-3 text-md font-bold text-white transition-colors hover:bg-brand-600"
          >
            로그인 화면으로
          </Link>
        </div>
      ) : pending.completed ? (
        <SocialSignupDone provider={pending.provider} />
      ) : (
        <SocialSignupForm
          provider={pending.provider}
          email={pending.email}
          emailLocked={pending.emailVerified && Boolean(pending.email)}
          name={pending.name}
        />
      )}
    </PageShell>
  );
}
