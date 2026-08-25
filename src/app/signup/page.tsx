import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { StepFlow } from "@/components/sub/Ui";

export const metadata: Metadata = { title: "회원가입" };

const SIGNUP_STEPS = [
  { title: "약관 동의", desc: "이용약관과 개인정보 수집·이용에 동의합니다." },
  { title: "정보 입력", desc: "소속 기관과 담당자 정보를 입력합니다." },
  { title: "이메일 인증", desc: "입력한 주소로 발송된 인증 메일을 확인합니다." },
  { title: "가입 완료", desc: "사무국 확인 후 회원 등급이 부여됩니다." },
];

export default function Page() {
  return (
    <PageShell
      href="/signup"
      title="회원가입"
      category="회원"
      desc="홈페이지 회원가입은 조합 회원사 가입과 별개입니다."
    >
      <StepFlow steps={SIGNUP_STEPS} />

      <div className="mx-auto mt-14 max-w-2xl">
        <form className="rounded-2xl border border-line bg-white p-8 lg:p-10">
          {/* 약관 */}
          <fieldset>
            <legend className="text-lg font-bold text-navy-900">약관 동의</legend>
            <div className="mt-5 space-y-3">
              {[
                { id: "terms", label: "이용약관 동의", href: "/terms", required: true },
                { id: "privacy", label: "개인정보 수집·이용 동의", href: "/privacy", required: true },
                { id: "marketing", label: "뉴스레터 수신 동의", href: null, required: false },
              ].map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg bg-surface px-5 py-4 text-md text-ink-700"
                >
                  <input
                    type="checkbox"
                    name={t.id}
                    required={t.required}
                    className="size-4 shrink-0 rounded border-line accent-brand-600"
                  />
                  <span className="flex-1">
                    {t.label}
                    <span
                      className={`ml-2 text-xs font-bold ${
                        t.required ? "text-flame-600" : "text-ink-400"
                      }`}
                    >
                      {t.required ? "필수" : "선택"}
                    </span>
                  </span>
                  {t.href && (
                    <Link
                      href={t.href}
                      className="shrink-0 text-sm text-brand-600 underline underline-offset-2"
                    >
                      전문보기
                    </Link>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 회원 정보 */}
          <fieldset className="mt-10">
            <legend className="text-lg font-bold text-navy-900">회원 정보</legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                { id: "company", label: "기관·회사명", type: "text", full: true, ac: "organization" },
                { id: "name", label: "담당자 이름", type: "text", full: false, ac: "name" },
                { id: "dept", label: "부서·직위", type: "text", full: false, ac: "organization-title" },
                { id: "email", label: "이메일", type: "email", full: false, ac: "email" },
                { id: "tel", label: "연락처", type: "tel", full: false, ac: "tel" },
              ].map((f) => (
                <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                  <label
                    htmlFor={`signup-${f.id}`}
                    className="mb-2 block text-base font-bold text-navy-900"
                  >
                    {f.label}
                  </label>
                  <input
                    id={`signup-${f.id}`}
                    name={f.id}
                    type={f.type}
                    autoComplete={f.ac}
                    required
                    className="w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors focus:border-brand-500"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="flex-1 rounded-md bg-brand-600 py-4 text-md font-bold text-white transition-colors hover:bg-navy-900"
            >
              가입 신청
            </button>
            <Link
              href="/"
              className="rounded-md px-8 py-4 text-center text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
            >
              취소
            </Link>
          </div>
        </form>

        <p className="mt-6 rounded-lg bg-surface px-5 py-4 text-base leading-relaxed text-ink-600">
          조합 회원사 가입을 원하시면{" "}
          <Link href="/members/join" className="font-bold text-brand-600 hover:underline">
            회원사 가입안내
          </Link>
          를 확인해 주세요.
        </p>
      </div>
    </PageShell>
  );
}
