import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, InfoCard, Prose } from "@/components/sub/Ui";
import HistoryTimeline from "@/components/sub/HistoryTimeline";
import { getPageTexts, listAboutCards, listHistory } from "@/lib/db/about-content";
import { groupHistory } from "@/lib/about-content-types";

export const metadata: Metadata = { title: "설립목적 및 연혁" };

export default async function Page() {
  const [texts, purposes, entries] = await Promise.all([
    getPageTexts(),
    listAboutCards("purpose"),
    listHistory(),
  ]);

  const years = groupHistory(entries);

  return (
    <PageShell href="/about/history" desc={texts["history.desc"]}>
      {/* 설립목적 */}
      <section>
        <SectionHeading
          eyebrow={`목적 ${purposes.length}개 항`}
          title="설립목적"
          desc={texts["history.purposeDesc"]}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {purposes.map((p) => (
            <InfoCard key={p.id} title={p.title} desc={p.body} />
          ))}
        </div>
      </section>

      {/* 설립근거 */}
      <section className="mt-11 rounded-2xl bg-surface p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-14">
          <div>
            <p className="data-line text-flame-600">산업기술연구조합육성법</p>
            <p className="mt-3 text-xl font-bold text-navy-900">설립근거</p>
          </div>
          <Prose html={texts["history.basis"] ?? ""} />
        </div>
      </section>

      {/* 연혁 */}
      <section className="mt-11">
        <SectionHeading eyebrow="조합 활동" title="연혁" />

        <div className="mt-12">
          <HistoryTimeline years={years} />
        </div>
      </section>
    </PageShell>
  );
}
