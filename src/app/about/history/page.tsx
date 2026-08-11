import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, InfoCard, Prose } from "@/components/sub/Ui";
import { PURPOSES, HISTORY } from "@/lib/page-data";

export const metadata: Metadata = { title: "설립목적 및 연혁" };

export default function Page() {
  return (
    <PageShell
      href="/about/history"
      eng="Purpose & History"
      desc="조합이 왜 만들어졌고 어떤 길을 걸어왔는지 소개합니다."
    >
      {/* 설립목적 */}
      <section>
        <SectionHeading
          eyebrow="Purpose"
          title="설립목적"
          desc="한국클라우드컴퓨팅연구조합은 산업기술연구조합 육성법에 따라 설립된 비영리 연구조합입니다. 회원사가 개별적으로 수행하기 어려운 연구개발과 인력양성을 공동으로 추진합니다."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PURPOSES.map((p) => (
            <InfoCard key={p.no} no={p.no} title={p.title} desc={p.desc} />
          ))}
        </div>
      </section>

      {/* 설립근거 */}
      <section className="mt-20 rounded-2xl bg-surface p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-14">
          <div>
            <p className="label-mono text-flame-600">Legal Basis</p>
            <p className="mt-3 text-[1.35rem] font-bold text-navy-900">설립근거</p>
          </div>
          <Prose>
            <p>
              <b>산업기술연구조합 육성법</b>에 근거해 설립된 연구조합으로, 동일 산업 분야의 기업과
              연구기관이 공동으로 연구개발을 수행할 수 있도록 하는 법적 조직입니다.
            </p>
            <p>
              <b>클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률</b>이 정한 클라우드컴퓨팅산업의 진흥
              취지에 따라, 기술개발·표준화·인력양성 과제를 회원사와 함께 수행합니다.
            </p>
          </Prose>
        </div>
      </section>

      {/* 연혁 */}
      <section className="mt-20">
        <SectionHeading eyebrow="History" title="연혁" />

        <div className="mt-12 space-y-14">
          {HISTORY.map((block) => (
            <div key={block.year} className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-14">
              <p className="label-mono text-[1.5rem] font-bold tabular-nums leading-none text-brand-200">
                {block.year}
              </p>
              <ul className="relative border-l-2 border-line pl-8">
                {block.events.map((e) => (
                  <li key={e.date} className="relative pb-7 last:pb-0">
                    <span
                      className="absolute -left-[41px] top-1.5 size-3 rounded-full border-2 border-white bg-flame-500 ring-1 ring-line"
                      aria-hidden
                    />
                    <p className="label-mono tabular-nums text-brand-600">{e.date}</p>
                    <p className="mt-1.5 text-[1rem] font-medium text-ink-900">{e.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
