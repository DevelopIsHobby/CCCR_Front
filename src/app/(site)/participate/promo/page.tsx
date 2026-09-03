import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import ServiceIntro from "@/components/sub/ServiceIntro";
import PromoDialog from "@/components/PromoDialog";
import { getApplicant } from "@/lib/db/me";

export const metadata: Metadata = { title: "홍보 서비스 신청" };

export default async function Page() {
  const me = await getApplicant();

  return (
    <PageShell
      href="/participate/promo"
      desc="회원사·기관의 제품과 행사를 조합 명단으로 알려드립니다."
    >
      <ServiceIntro
        eyebrow="회원사 · 유관기관"
        title="홍보 서비스 신청"
        desc="조합이 가지고 있는 회원사·유관기관 명단으로 제품·서비스·교육·행사 소식을 대신 알려드립니다."
        points={[
          { title: "메일 발송", desc: "조합 명단으로 소식을 보내드립니다." },
          { title: "기간 선택", desc: "한 번만 보낼지, 주기적으로 보낼지 고르실 수 있습니다." },
          { title: "자료 첨부", desc: "홍보 그림과 안내 파일을 함께 올리실 수 있습니다." },
        ]}
        steps={[
          "홍보 내용과 자료를 올려 신청",
          "접수 확인 메일 받기",
          "사무국이 내용·일정 검토",
          "발송 진행과 완료 안내",
        ]}
        notes={[
          "홍보 그림은 5MB, 첨부파일은 10MB까지 올리실 수 있습니다.",
          "배너나 메일에 그대로 실을 짧은 문구를 적어 주시면 그대로 씁니다. 없으면 사무국이 정합니다.",
          "내용이 조합 사업과 맞지 않으면 진행이 어려울 수 있습니다.",
          "시작 희망일은 여유 있게 잡아 주세요. 검토와 준비에 시간이 걸립니다.",
        ]}
        action={<PromoDialog me={me} />}
      />

      <p className="mt-14 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        넣으신 신청이 어떻게 되고 있는지는{" "}
        <Link href="/participate/status" className="font-bold text-brand-600 hover:underline">
          신청 현황 조회
        </Link>
        에서 확인하실 수 있습니다.
      </p>
    </PageShell>
  );
}
