import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { ContactBanner } from "@/components/sub/Ui";
import { NEEDS } from "@/lib/page-data";

export const metadata: Metadata = { title: "사업의 필요성" };

export default function Page() {
  return (
    <PageShell
      href="/business/why"
      desc="컴퓨팅 수요의 급증, 클라우드 고도화 기술 확보, 대학·벤쳐 경쟁력 강화 — 세 가지 배경에서 조합의 사업이 출발합니다."
    >
      <ol className="space-y-6">
        {NEEDS.map((need, i) => (
          <li
            key={need.title}
            className="rounded-2xl border border-line bg-white p-8 lg:p-10"
          >
            <div className="grid gap-6 lg:grid-cols-[72px_1fr] lg:gap-10">
              {/* 번호는 원본의 1·2·3 구분을 그대로 따른다 */}
              <p className="label-mono text-3xl font-bold leading-none text-brand-200">
                {String(i + 1).padStart(2, "0")}
              </p>

              <div>
                <h2 className="text-xl font-bold leading-snug text-navy-900 lg:text-2xl">
                  {need.title}
                </h2>
                <span className="mt-5 block h-1 w-10 rounded-full bg-flame-500" />

                <ul className="mt-7 space-y-6">
                  {need.items.map((item) => (
                    <li key={item.text}>
                      <div className="flex gap-4">
                        <span
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500"
                          aria-hidden
                        />
                        <p className="text-md leading-[1.85] text-ink-600">{item.text}</p>
                      </div>

                      {item.sub && (
                        <ul className="ml-8 mt-5 grid gap-2 sm:grid-cols-2">
                          {item.sub.map((s) => (
                            <li
                              key={s}
                              className="rounded-lg bg-surface px-5 py-3.5 text-base leading-relaxed text-ink-900"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <ContactBanner
        title="조합이 어떤 사업을 하는지 궁금하신가요?"
        desc="공동 연구개발부터 교육, 정책 연구까지 조합의 사업을 소개합니다."
        href="/business/programs"
        cta="주요사업 보기"
      />
    </PageShell>
  );
}
