import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import ServiceIntro from "@/components/sub/ServiceIntro";
import ProposalDialog from "@/components/ProposalDialog";
import { getApplicant } from "@/lib/db/me";

export const metadata: Metadata = { title: "교육사업 제안" };

export default async function Page() {
  const me = await getApplicant();

  return (
    <PageShell
      href="/participate/proposal"
      desc="조합과 함께 교육과정을 열고 싶은 기관·기업의 제안을 받습니다."
    >
      <ServiceIntro
        eyebrow="대학 · 교육기관 · 회원사"
        title="교육사업 제안"
        desc="조합은 클라우드·AI 인프라 분야의 교육과정을 회원사·대학·교육기관과 함께 운영하고 있습니다. 함께 하실 과정이나 협력 방안을 알려 주세요."
        points={[
          { title: "공동 운영", desc: "과정을 함께 기획하고 나누어 맡습니다." },
          { title: "강사 · 장소", desc: "강사 파견이나 실습 장소 협력도 제안하실 수 있습니다." },
          { title: "누구나", desc: "회원사가 아니어도 제안하실 수 있습니다." },
        ]}
        steps={[
          "제안 내용을 적어 보내기",
          "접수 확인 메일 받기",
          "담당자가 검토",
          "담당자가 직접 연락",
        ]}
        notes={[
          "과정 주제, 대상, 기간, 협력 형태를 적어 주시면 검토가 빠릅니다.",
          "검토에는 시간이 걸릴 수 있습니다. 사무국 사업 일정과 함께 보기 때문입니다.",
          "조합이 운영 중인 교육은 별도 사이트(cccr-edu.or.kr)에서 보실 수 있습니다.",
        ]}
        action={<ProposalDialog me={me} />}
      />

      <p className="mt-11 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        보내신 제안이 어떻게 되고 있는지는{" "}
        <Link href="/participate/status" className="font-bold text-brand-600 hover:underline">
          신청 현황 조회
        </Link>
        에서 확인하실 수 있습니다.
      </p>
    </PageShell>
  );
}
