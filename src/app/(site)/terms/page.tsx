import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { LegalDoc } from "@/components/sub/LegalDoc";
import { TERMS_ARTICLES } from "@/lib/terms-data";

export const metadata: Metadata = { title: "이용약관" };

/* 가입 화면 팝업과 같은 원문을 쓴다. 주소로 직접 들어온 경우를 위한 페이지다. */
export default function Page() {
  return (
    <PageShell
      href="/terms"
      title="이용약관"
      category="이용안내"
      desc="한국클라우드컴퓨팅연구조합이 제공하는 서비스의 이용 조건과 절차를 정합니다."
    >
      <LegalDoc articles={TERMS_ARTICLES} />
    </PageShell>
  );
}
