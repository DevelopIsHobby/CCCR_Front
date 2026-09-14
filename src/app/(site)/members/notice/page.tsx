import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, InfoCard } from "@/components/sub/Ui";
import NoticeSignupForm from "@/components/NoticeSignupForm";
import { getSiteSettings } from "@/lib/db/site-settings";
import { getApplicant } from "@/lib/db/me";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta("사업공고 안내", "/members/notice", "조합이 매주 모아 보내드리는 사업공고 안내입니다.");

const POINTS = [
  {
    title: "매주 한 번",
    desc: "국가 연구개발과제, 정부·유관기관 공모, 조합 참여사업 공고를 한 주 단위로 모아 보내드립니다.",
  },
  {
    title: "놓치는 공고 없이",
    desc: "부처별로 흩어진 공고를 사무국이 조합 사업과 관련된 것만 골라 정리합니다.",
  },
  {
    title: "담당자 메일함으로",
    desc: "따로 찾아보지 않으셔도 등록하신 주소로 갑니다. 받는 주소를 바꾸거나 그만 받고 싶으시면 사무국으로 알려주세요.",
  },
];

export default async function Page() {
  const site = await getSiteSettings();

  return (
    <PageShell
      href="/members/notice"
      desc="조합이 매주 모아 보내드리는 사업공고 안내입니다."
    >
      <SectionHeading
        eyebrow="주 1회 발송"
        title="사업공고 안내"
        desc="회원사가 참여할 수 있는 국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 모아 매주 보내드립니다."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {POINTS.map((p) => (
          <InfoCard key={p.title} title={p.title} desc={p.desc} />
        ))}
      </div>

      <h3 className="mt-12 border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
        수신 신청
      </h3>
      <p className="mt-5 rounded-lg bg-surface px-5 py-4 text-base leading-relaxed text-ink-600">
        신청하시면 바로 발송되지 않습니다. 사무국에서 확인한 뒤 승인해 드리고, 그때부터
        매주 보내드립니다. 확인에는 며칠이 걸릴 수 있습니다.
      </p>
      <NoticeSignupForm me={await getApplicant()} />

      <p className="mt-10 rounded-xl bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        아직 조합 회원사가 아니신가요?{" "}
        <Link href="/members/join" className="font-bold text-brand-600 hover:underline">
          회원사 가입안내
        </Link>
        를 참고해 주세요. 문의는 {site.tel || "사무국"}
        {site.email && (
          <>
            {" · "}
            <a href={`mailto:${site.email}`} className="font-bold text-brand-600 hover:underline">
              {site.email}
            </a>
          </>
        )}
        로 주시면 됩니다.
      </p>
    </PageShell>
  );
}
