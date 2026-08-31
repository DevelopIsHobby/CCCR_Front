import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { LegalDoc } from "@/components/sub/LegalDoc";
import { PRIVACY_ARTICLES, PRIVACY_INTRO } from "@/lib/legal-data";

export const metadata: Metadata = { title: "개인정보처리방침" };

/* 푸터 팝업과 같은 원문을 쓴다. 주소로 직접 들어온 경우를 위한 페이지다. */
export default function Page() {
  return (
    <PageShell href="/privacy" title="개인정보처리방침" category="이용안내" desc={PRIVACY_INTRO}>
      <LegalDoc articles={PRIVACY_ARTICLES} />
    </PageShell>
  );
}
