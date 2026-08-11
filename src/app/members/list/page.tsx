import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, ContactBanner } from "@/components/sub/Ui";
import { MEMBERS, MEMBER_STATS } from "@/lib/page-data";

export const metadata: Metadata = { title: "회원사 현황" };

const FIELD_TONE: Record<string, string> = {
  인프라: "bg-brand-50 text-brand-700",
  플랫폼: "bg-flame-100 text-flame-700",
  서비스: "bg-navy-900/8 text-navy-800",
  "AI·반도체": "bg-brand-100 text-brand-700",
  컨설팅: "bg-surface text-ink-600",
};

export default function Page() {
  return (
    <PageShell
      href="/members/list"
      eng="Members"
      desc="클라우드 인프라부터 서비스까지, 산업 전 영역의 기업이 조합에 참여하고 있습니다."
    >
      {/* 통계 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBER_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-7">
            <p className="text-[0.85rem] font-medium text-ink-600">{s.label}</p>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="label-mono text-[2rem] font-bold tabular-nums leading-none text-navy-900">
                {s.value}
              </span>
              <span className="text-[0.85rem] text-ink-400">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 회원사 목록 */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Member Companies"
          title="참여 회원사"
          desc="가나다순으로 표시되며, 회원사 요청에 따라 일부 기업은 표기하지 않습니다."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <div
              key={m.name}
              className="group flex flex-col justify-between gap-5 rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_14px_28px_-16px_rgba(6,42,85,0.35)]"
            >
              {/* 회원사 로고 이미지 확보 시 교체 */}
              <div className="grid h-14 place-items-center rounded-md bg-surface">
                <span className="label-mono text-ink-400">Logo</span>
              </div>
              <div>
                <p className="text-[0.975rem] font-bold text-navy-900">{m.name}</p>
                <span
                  className={`mt-2 inline-flex rounded px-2 py-0.5 text-[0.7rem] font-bold ${
                    FIELD_TONE[m.field]
                  }`}
                >
                  {m.field}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-lg bg-surface px-5 py-4 text-[0.85rem] text-ink-600">
          위 목록은 화면 구성을 위한 예시입니다. 실제 회원사 명단과 로고로 교체가 필요합니다.
        </p>
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
