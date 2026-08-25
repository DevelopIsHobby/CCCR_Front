import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";

export const metadata: Metadata = { title: "로그인" };

export default function Page() {
  return (
    <PageShell
      href="/login"
      title="로그인"
      category="회원"
      desc="회원사 전용 자료와 교육 신청은 로그인 후 이용할 수 있습니다."
    >
      <div className="mx-auto max-w-md">
        <form className="rounded-2xl border border-line bg-white p-8 lg:p-10">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="login-id"
                className="mb-2 block text-base font-bold text-navy-900"
              >
                아이디
              </label>
              <input
                id="login-id"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="login-pw"
                className="mb-2 block text-base font-bold text-navy-900"
              >
                비밀번호
              </label>
              <input
                id="login-pw"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2 text-base text-ink-600">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-line accent-brand-600"
            />
            아이디 저장
          </label>

          <button
            type="submit"
            className="mt-7 w-full rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900"
          >
            로그인
          </button>

          <div className="mt-6 flex items-center justify-center gap-4 text-base">
            <Link href="#" className="text-ink-600 hover:text-brand-600">
              아이디 찾기
            </Link>
            <span className="text-line">|</span>
            <Link href="#" className="text-ink-600 hover:text-brand-600">
              비밀번호 재설정
            </Link>
          </div>
        </form>

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
