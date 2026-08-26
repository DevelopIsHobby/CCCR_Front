import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, ContactBanner } from "@/components/sub/Ui";
import MemberDirectory from "@/components/sub/MemberDirectory";
import { MEMBER_STATS, MEMBER_TOTAL } from "@/lib/page-data";

export const metadata: Metadata = { title: "회원사 현황" };

export default function Page() {
  return (
    <PageShell
      href="/members/list"
      desc="클라우드 인프라부터 서비스까지, 산업 전 영역의 기업이 조합에 참여하고 있습니다."
    >
      {/* 통계 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBER_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-7">
            <p className="text-base font-medium text-ink-600">{s.label}</p>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="label-mono text-3xl font-bold tabular-nums leading-none text-navy-900">
                {s.value}
              </span>
              <span className="text-base text-ink-400">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 회원사 명단 */}
      <section className="mt-16">
        <SectionHeading
          eyebrow={`전체 ${MEMBER_TOTAL}개사`}
          title="참여 회원사"
          desc="회사명을 누르면 해당 기업 홈페이지로 이동합니다."
        />

        <div className="mt-10">
          <MemberDirectory />
        </div>
      </section>

      <ContactBanner
        title="회원사로 함께하시겠습니까?"
        desc="가입 자격과 절차, 회비를 자세히 안내해 드립니다."
        href="/members/join"
        cta="가입안내 보기"
      />
    </PageShell>
  );
}
