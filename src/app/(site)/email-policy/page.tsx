import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { LegalDoc } from "@/components/sub/LegalDoc";
import { EMAIL_POLICY_ARTICLES } from "@/lib/legal-data";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta(
  "이메일무단수집거부",
  "/email-policy",
  "이 홈페이지에 실린 이메일 주소를 프로그램이나 그 밖의 방법으로 무단 수집하는 것을 거부합니다. 위반 시 정보통신망법에 따라 처벌될 수 있습니다.",
);

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
