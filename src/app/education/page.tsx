import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, ContactBanner } from "@/components/sub/Ui";
import { COURSES } from "@/lib/page-data";

export const metadata: Metadata = { title: "교육과정" };

const STATUS_TONE: Record<string, string> = {
  접수중: "bg-flame-500 text-white",
  모집중: "bg-brand-600 text-white",
  상시: "bg-surface text-ink-600",
};

export default function Page() {
  return (
    <PageShell
      href="/education"
      title="교육과정"
      category="교육"
      desc="산업 현장이 요구하는 실무 역량을 갖춘 인력을 양성합니다."
    >
      <SectionHeading
        eyebrow={`운영 과정 ${COURSES.length}개`}
        title="운영 과정"
        desc="회원사 임직원은 전 과정을 할인가로 수강할 수 있습니다. 과정별 세부 일정과 신청 방법은 공지사항에서 확인하세요."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {COURSES.map((c) => (
          <article
            key={c.title}
            className="flex flex-col rounded-xl border border-line bg-white p-8 transition-colors hover:border-brand-500"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${
                  STATUS_TONE[c.status]
                }`}
              >
                {c.status}
              </span>
              <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
                {c.level}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold leading-snug text-navy-900">{c.title}</h3>

            <dl className="mt-5 space-y-2 border-y border-line py-5">
              <div className="flex gap-4">
                <dt className="w-20 shrink-0 text-base font-bold text-navy-900">교육시간</dt>
                <dd className="text-base text-ink-600">{c.hours}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-20 shrink-0 text-base font-bold text-navy-900">교육대상</dt>
                <dd className="text-base text-ink-600">{c.target}</dd>
              </div>
            </dl>

            <ul className="mt-5 flex flex-1 flex-wrap content-start gap-2">
              {c.topics.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs text-ink-600"
                >
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <ContactBanner
        title="교육 일정이 궁금하신가요?"
        desc="과정별 개설 일정과 접수 기간은 공지사항에 안내됩니다."
        href="/board/notice"
        cta="공지사항 보기"
      />
    </PageShell>
  );
}
