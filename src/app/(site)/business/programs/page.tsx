import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { ContactBanner } from "@/components/sub/Ui";
import { PROGRAMS } from "@/lib/page-data";
import ProposalDialog from "@/components/ProposalDialog";
import { getApplicant } from "@/lib/db/me";

export const metadata: Metadata = { title: "주요사업" };

export default async function Page() {
  /* 로그인해 두었으면 제안 폼을 미리 채운다 */
  const me = await getApplicant();

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

      {/* 교육사업은 밖에서 함께 하자는 제안이 들어오는 창구가 필요하다 */}
      <section className="mt-16 overflow-hidden rounded-2xl bg-navy-900 px-8 py-12 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          <div>
            <p className="data-line text-flame-500">교육사업 협력</p>
            <p className="mt-4 text-xl font-bold leading-snug text-white lg:text-2xl">
              조합과 함께 교육과정을 열어보세요
            </p>
            <p className="mt-3 text-md leading-relaxed text-brand-100/70">
              대학·교육기관·회원사와 함께 클라우드·AI 인프라 과정을 운영하고 있습니다.
              함께 하실 과정이나 협력 방안을 제안해 주세요.
            </p>
          </div>

          <div className="shrink-0">
            <ProposalDialog tone="dark" me={me} />
          </div>
        </div>
      </section>

      <ContactBanner
        spacing="tight"
        title="사업 참여를 원하시나요?"
        desc="회원사 가입 절차와 회비를 안내해 드립니다."
        href="/members/join"
        cta="회원사 가입안내"
      />
    </PageShell>
  );
}
