import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, StepFlow, DefTable } from "@/components/sub/Ui";
import { IconArrow } from "@/components/Icons";
import { JOIN_STEPS, JOIN_DOCS, FEE_TABLE, MEMBER_BENEFITS } from "@/lib/page-data";

export const metadata: Metadata = { title: "회원사 가입안내" };

export default function Page() {
  return (
    <PageShell
      href="/members/join"
      desc="클라우드컴퓨팅 분야의 기업·기관이라면 누구나 조합에 참여할 수 있습니다."
    >
      {/* 혜택 */}
      <section>
        <SectionHeading eyebrow={`혜택 ${MEMBER_BENEFITS.length}가지`} title="회원사 혜택" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {MEMBER_BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-5 rounded-xl bg-surface p-7">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-flame-500" aria-hidden />
              <div>
                <p className="text-lg font-bold text-navy-900">{b.title}</p>
                <p className="mt-2 text-md leading-relaxed text-ink-600">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 가입 절차 */}
      <section className="mt-20">
        <SectionHeading eyebrow={`${JOIN_STEPS.length}단계`} title="가입 절차" />
        <div className="mt-10">
          <StepFlow steps={JOIN_STEPS} />
        </div>
      </section>

      {/* 회비 */}
      <section className="mt-20">
        <SectionHeading
          eyebrow={`등급 ${FEE_TABLE.length}종`}
          title="회원 등급 및 회비"
          desc="회비는 이사회 의결에 따라 변경될 수 있습니다. 정확한 금액은 사무국으로 문의해 주세요."
        />

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-y-2 border-navy-900 bg-surface">
                <th className="px-5 py-4 text-base font-bold text-navy-900">등급</th>
                <th className="px-5 py-4 text-base font-bold text-navy-900">가입 대상</th>
                <th className="px-5 py-4 text-base font-bold text-navy-900">가입비</th>
                <th className="px-5 py-4 text-base font-bold text-navy-900">연회비</th>
              </tr>
            </thead>
            <tbody>
              {FEE_TABLE.map((f) => (
                <tr key={f.grade} className="border-b border-line">
                  <td className="px-5 py-5 text-md font-bold text-brand-600">{f.grade}</td>
                  <td className="px-5 py-5 text-md text-ink-600">{f.target}</td>
                  <td className="label-mono px-5 py-5 tabular-nums text-ink-900">{f.entry}</td>
                  <td className="label-mono px-5 py-5 tabular-nums text-ink-900">{f.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 구비서류 */}
      <section className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeading eyebrow={`서류 ${JOIN_DOCS.length}종`} title="구비서류" />
          <ul className="mt-10 space-y-3">
            {JOIN_DOCS.map((doc) => (
              <li
                key={doc}
                className="flex items-start gap-3 border-b border-line pb-3 text-md text-ink-600"
              >
                <span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-100">
                  <span className="size-1.5 rounded-full bg-brand-600" />
                </span>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading eyebrow="사무국 기획운영팀" title="신청 및 문의" />
          <div className="mt-10">
            <DefTable
              rows={[
                { label: "접수처", value: "한국클라우드컴퓨팅연구조합 사무국 (기획운영팀)" },
                { label: "제출방법", value: "이메일 접수 또는 방문 접수" },
                {
                  label: "문의",
                  value: (
                    <>
                      02-000-0000 /{" "}
                      <a href="mailto:join@c3r.or.kr" className="text-brand-600 hover:underline">
                        join@c3r.or.kr
                      </a>
                    </>
                  ),
                },
              ]}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/info/archive"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-md font-bold text-white transition-colors hover:bg-navy-900"
              >
                가입신청서 내려받기
                <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about/location"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
              >
                찾아오시는 길
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
