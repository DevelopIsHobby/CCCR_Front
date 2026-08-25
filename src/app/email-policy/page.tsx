import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { LegalDoc } from "@/components/sub/LegalDoc";

export const metadata: Metadata = { title: "이메일무단수집거부" };

export default function Page() {
  return (
    <PageShell
      href="/email-policy"
      title="이메일무단수집거부"
      category="이용안내"
      desc="홈페이지에 게시된 이메일 주소의 무단 수집을 거부합니다."
    >
      <LegalDoc
        articles={[
          {
            title: "이메일 주소 무단수집 거부",
            paragraphs: [
              "본 홈페이지에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 정보통신망 이용촉진 및 정보보호 등에 관한 법률에 의해 형사처벌됨을 유념하시기 바랍니다.",
            ],
          },
          {
            title: "관련 법령",
            paragraphs: [
              "정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2 (전자우편주소의 무단 수집행위 등 금지)",
            ],
            list: [
              "누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니 된다.",
              "누구든지 제1항을 위반하여 수집된 전자우편주소를 판매·유통하여서는 아니 된다.",
              "누구든지 제1항 및 제2항에 따라 수집·판매 및 유통이 금지된 전자우편주소임을 알면서 이를 정보 전송에 이용하여서는 아니 된다.",
            ],
          },
        ]}
      />
    </PageShell>
  );
}
