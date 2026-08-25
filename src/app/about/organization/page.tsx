import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, DefTable } from "@/components/sub/Ui";
import { ORG_UNITS } from "@/lib/page-data";

export const metadata: Metadata = { title: "조직도" };

function Node({
  label,
  tone = "line",
  className = "",
}: {
  label: string;
  tone?: "navy" | "brand" | "line";
  className?: string;
}) {
  const tones = {
    navy: "bg-navy-900 text-white",
    brand: "bg-brand-600 text-white",
    line: "bg-white text-navy-900 ring-1 ring-line",
  };
  return (
    <div
      className={`flex h-14 min-w-[160px] items-center justify-center rounded-lg px-6 text-md font-bold ${tones[tone]} ${className}`}
    >
      {label}
    </div>
  );
}

export default function Page() {
  return (
    <PageShell
      href="/about/organization"
      desc="총회와 이사회를 중심으로 사무국과 분과위원회가 운영됩니다."
    >
      <section>
        <SectionHeading eyebrow="총회 · 이사회 · 사무국" title="조직 구성" />

        <div className="mt-12 overflow-x-auto rounded-2xl bg-surface p-8 lg:p-14">
          <div className="flex min-w-[720px] flex-col items-center">
            {/* 총회 */}
            <Node label={ORG_UNITS.top} tone="navy" />
            <span className="h-8 w-px bg-line" aria-hidden />

            {/* 이사회 + 감사 */}
            <div className="relative flex items-center">
              <Node label={ORG_UNITS.second} tone="navy" />
              <span className="absolute left-full h-px w-16 bg-line" aria-hidden />
              <div className="absolute left-[calc(100%+4rem)]">
                <Node label={ORG_UNITS.audit} />
              </div>
            </div>
            <span className="h-8 w-px bg-line" aria-hidden />

            {/* 사무국 */}
            <Node label={ORG_UNITS.office} tone="brand" />
            <span className="h-8 w-px bg-line" aria-hidden />

            {/* 팀 — 가로 연결선은 첫/마지막 열의 중심을 정확히 잇는다 */}
            <div className="relative w-full">
              <span
                className="absolute top-0 h-px bg-line"
                style={{
                  left: `${50 / ORG_UNITS.teams.length}%`,
                  width: `${100 - 100 / ORG_UNITS.teams.length}%`,
                }}
                aria-hidden
              />
              <div className="flex justify-between gap-4 pt-8">
                {ORG_UNITS.teams.map((t) => (
                  <div key={t} className="relative flex flex-1 justify-center">
                    <span className="absolute -top-8 h-8 w-px bg-line" aria-hidden />
                    <Node label={t} className="w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 분과위원회 */}
      <section className="mt-20">
        <SectionHeading
          eyebrow={`분과 ${ORG_UNITS.committees.length}개`}
          title="분과위원회"
          desc="기술 영역별로 분과를 두어 회원사가 관심 분야에 직접 참여할 수 있도록 운영합니다."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORG_UNITS.committees.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-line bg-white p-6 transition-colors hover:border-brand-500"
            >
              <span className="block h-1 w-8 rounded-full bg-brand-200" />
              <p className="mt-3 text-lg font-bold text-navy-900">{c.name}</p>
              <p className="mt-1.5 text-base text-ink-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 기구별 역할 */}
      <section className="mt-20">
        <SectionHeading eyebrow="기구 5개" title="기구별 역할" />
        <div className="mt-10">
          <DefTable
            rows={[
              { label: "총회", value: "조합의 최고 의결기구로 정관 변경, 사업계획 및 예산·결산 승인, 임원 선출을 의결합니다." },
              { label: "이사회", value: "총회에서 위임한 사항과 조합 운영에 관한 주요 사항을 심의·의결합니다. 회원 가입 승인도 이사회를 거칩니다." },
              { label: "감사", value: "조합의 업무와 회계를 감사하고 그 결과를 총회에 보고합니다." },
              { label: "사무국", value: "조합의 일상 업무를 수행합니다. 연구개발 과제 관리, 교육사업 운영, 대외 협력, 회원 지원을 담당합니다." },
              { label: "분과위원회", value: "기술 영역별 현안을 논의하고 공동 연구 과제를 발굴합니다. 회원사 실무자가 위원으로 참여합니다." },
            ]}
          />
        </div>
      </section>
    </PageShell>
  );
}
