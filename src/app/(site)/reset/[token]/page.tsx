import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import ResetForm from "@/components/ResetForm";
import { isResetTokenUsable } from "@/lib/auth/reset-actions";

export const metadata: Metadata = { title: "새 비밀번호 정하기" };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const usable = await isResetTokenUsable(token);

  return (
    <PageShell
      href="/reset"
      title="새 비밀번호 정하기"
      category="로그인"
      desc="새로 쓰실 비밀번호를 정해 주세요."
    >
      <div className="mx-auto max-w-lg">
        {usable ? (
          <ResetForm token={token} />
        ) : (
          <div className="rounded-xl bg-surface px-6 py-10 text-center">
            <p className="text-md font-bold text-navy-900">이 링크는 더 쓸 수 없습니다</p>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              링크는 한 시간 동안만 쓸 수 있고, 한 번 쓰면 만료됩니다.
              <br />
              다시 요청해 주세요.
            </p>
            <Link
              href="/reset"
              className="mt-7 inline-block rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              재설정 링크 다시 받기
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
