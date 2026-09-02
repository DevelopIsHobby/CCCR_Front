import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { ContactBanner } from "@/components/sub/Ui";
import { PROGRAMS } from "@/lib/page-data";

export const metadata: Metadata = { title: "주요사업" };

export default function Page() {
  return (
    <PageShell
      href="/business/programs"
      desc="조합은 네 갈래로 사업을 추진합니다."
    >
      {/* 원본의 1~4 구분과 2×2 배치를 카드 격자로 옮긴다 */}
      <ol className="grid gap-6 lg:grid-cols-2">
        {PROGRAMS.map((p, i) => (
          <li
            key={p.title}
            className="group flex flex-col rounded-2xl border border-line bg-white p-8 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_36px_-20px_rgba(6,42,85,0.35)] lg:p-10"
          >
            <div className="flex items-baseline gap-4">
              <span className="label-mono text-3xl font-bold leading-none text-brand-200 transition-colors group-hover:text-flame-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-bold leading-snug text-navy-900">{p.title}</h2>
            </div>

            <span className="mt-6 block h-px w-full bg-line" />

            <ul className="mt-6 space-y-3.5">
              {p.items.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-flame-500"
                    aria-hidden
                  />
                  <p className="text-md leading-relaxed text-ink-600">{item}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <ContactBanner
        title="사업 참여를 원하시나요?"
        desc="회원사 가입 절차와 회비를 안내해 드립니다."
        href="/members/join"
        cta="회원사 가입안내"
      />
    </PageShell>
  );
}
