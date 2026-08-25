import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, ContactBanner } from "@/components/sub/Ui";
import { PROGRAMS } from "@/lib/page-data";

export const metadata: Metadata = { title: "주요사업" };

export default function Page() {
  return (
    <PageShell
      href="/business/programs"
      desc="공동 연구개발, 전문기술 교육, 정책 연구, 정보 제공의 네 축으로 사업을 운영합니다."
    >
      <SectionHeading eyebrow={`사업 영역 ${PROGRAMS.length}개`} title="사업 영역" />

      <div className="mt-12 space-y-6">
        {PROGRAMS.map((p) => (
          <article
            key={p.title}
            className="grid gap-8 rounded-2xl border border-line bg-white p-8 transition-colors hover:border-brand-500 lg:grid-cols-[340px_1fr] lg:gap-14 lg:p-12"
          >
            <div>
              <span className="data-line text-flame-600">세부 사업 {p.items.length}건</span>
              <h3 className="mt-5 text-xl font-bold leading-snug text-navy-900">
                {p.title}
              </h3>
              <p className="mt-3 text-md leading-relaxed text-ink-600">{p.summary}</p>
            </div>

            <ul className="grid gap-3 self-center sm:grid-cols-2">
              {p.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg bg-surface px-5 py-4 text-md leading-relaxed text-ink-700"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-flame-500"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <ContactBanner
        title="사업 참여를 원하시나요?"
        desc="회원사는 과제 기획 단계부터 참여할 수 있습니다."
        href="/members/join"
        cta="회원사 가입안내"
      />
    </PageShell>
  );
}
