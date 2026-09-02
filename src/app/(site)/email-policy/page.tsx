import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { LegalDoc } from "@/components/sub/LegalDoc";
import { EMAIL_POLICY_ARTICLES } from "@/lib/legal-data";

export const metadata: Metadata = { title: "이메일무단수집거부" };

/* 푸터 팝업과 같은 원문을 쓴다. */
export default function Page() {
  return (
    <PageShell
      href="/email-policy"
      title="이메일무단수집거부"
      category="이용안내"
      desc="홈페이지에 게시된 이메일 주소의 무단 수집을 거부합니다."
    >
      <LegalDoc articles={EMAIL_POLICY_ARTICLES} />
    </PageShell>
  );
}
