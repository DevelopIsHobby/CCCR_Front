import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import SignupSteps from "@/components/signup/SignupSteps";
import TypeStep from "./TypeStep";
import AgreeStep from "./AgreeStep";
import SignUpForm from "./SignUpForm";
import { getSession } from "@/lib/auth/session";
import { enabledProviders } from "@/lib/auth/social";
import { intentFromParams } from "@/lib/auth/signup-intent";
import { memberTypeFromSlug } from "@/lib/user-types";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta(
  "회원가입",
  "/signup",
  "홈페이지 회원가입 안내. 개인회원·기업회원으로 가입하시면 사무국 승인 후 회원 전용 자료와 신청 현황을 이용하실 수 있습니다.",
);

/*
  회원가입. 세 단계를 화면 하나가 주소창 값으로 나눠 그린다.

    /signup                                         1단계 회원 유형
    /signup?type=personal                           2단계 약관 동의 + 가입 방법
    /signup?type=personal&agreeTerms=on&agreePrivacy=on   3단계 정보 입력

  전에는 모든 칸을 한 화면에 몰아 두어 무엇을 해야 하는지 한눈에 보이지 않았다.
  주소창으로 나누면 뒤로 가기가 앞 단계로 돌아가고, 다시 불러와도 단계가 그대로 남는다.
  셋째 단계의 동의는 서버가 다시 확인하므로(signup-actions.ts) 주소를 고쳐도 건너뛸 수 없다.
*/
type Search = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  if (await getSession()) redirect("/");

  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return (Array.isArray(v) ? v[0] : v) ?? null;
  };

  const memberType = memberTypeFromSlug(get("type"));
  const intent = intentFromParams(get);
  const step = intent ? 3 : memberType ? 2 : 1;

  return (
    <PageShell
      href="/signup"
      title="회원가입"
      category="회원"
      desc="개인회원·기업회원으로 가입하시면 사무국 승인 후 회원 전용 자료를 이용하실 수 있습니다."
    >
      <SignupSteps current={step} />

      <div className="mt-10">
        {intent ? (
          <SignUpForm memberType={intent.memberType} newsletter={intent.newsletter} />
        ) : memberType ? (
          <AgreeStep memberType={memberType} providers={enabledProviders()} />
        ) : (
          <TypeStep />
        )}
      </div>
    </PageShell>
  );
}
