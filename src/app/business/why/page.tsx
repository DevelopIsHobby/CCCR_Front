import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, ContactBanner } from "@/components/sub/Ui";
import { NEED_STATS, NEED_POINTS } from "@/lib/page-data";

export const metadata: Metadata = { title: "사업의 필요성" };

export default function Page() {
  return (
    <PageShell
      href="/business/why"
      eng="Why We Work"
      desc="개별 기업이 홀로 감당하기 어려운 과제를 함께 풀기 위해 조합이 존재합니다."
    >
      {/* 배경 */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 px-8 py-12 lg:px-14 lg:py-16">
        <div className="hex-field absolute inset-0" aria-hidden />
        <div
          className="absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="label-mono text-flame-500">Background</p>
          <p className="mt-5 max-w-3xl text-[1.5rem] font-bold leading-[1.45] text-white lg:text-[2rem]">
            클라우드는 특정 기업의 상품이 아니라
            <br />
            <span className="text-brand-200">산업 전체가 올라서는 바닥</span>입니다.
          </p>
          <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-brand-100/70">
            바닥을 다지는 일은 한 기업의 투자만으로 끝나지 않습니다. 기술을 함께 검증하고, 기준을
            함께 만들고, 사람을 함께 길러야 산업이 다음 단계로 넘어갑니다.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {NEED_STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/15 bg-white/5 p-6">
                <p className="text-[1.75rem] font-bold leading-none text-flame-500">{s.value}</p>
                <p className="mt-3 text-[0.95rem] font-bold text-white">{s.label}</p>
                <p className="mt-2 text-[0.825rem] leading-relaxed text-brand-100/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 필요성 */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="Necessity"
          title="공동 대응이 필요한 이유"
          desc="조합이 수행하는 사업은 아래 네 가지 문제의식에서 출발합니다."
        />

        <div className="mt-12 space-y-4">
          {NEED_POINTS.map((p) => (
            <div
              key={p.no}
              className="group grid gap-4 rounded-xl border border-line bg-white p-8 transition-colors hover:border-brand-500 lg:grid-cols-[auto_1fr] lg:gap-10"
            >
              <span className="label-mono text-[1.75rem] font-bold tabular-nums leading-none text-brand-100 transition-colors group-hover:text-flame-500">
                {p.no}
              </span>
              <div>
                <p className="text-[1.15rem] font-bold leading-snug text-navy-900">{p.title}</p>
                <p className="mt-3 max-w-3xl text-[0.925rem] leading-relaxed text-ink-600">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContactBanner
        title="조합이 어떤 사업을 하는지 궁금하신가요?"
        desc="공동 연구개발부터 교육, 정책 연구까지 네 가지 축으로 운영합니다."
        href="/business/programs"
        cta="주요사업 보기"
      />
    </PageShell>
  );
}
