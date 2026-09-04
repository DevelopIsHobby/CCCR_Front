import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, StepFlow, DefTable } from "@/components/sub/Ui";
import { IconArrow, IconChevron } from "@/components/Icons";
import { getSiteSettings } from "@/lib/db/site-settings";
import {
  JOIN_SECTIONS,
  JOIN_TARGET,
  JOIN_STEPS,
  JOIN_DOCS,
  JOIN_DOC_NOTES,
  FEE_TABLE,
  MEMBER_BENEFITS,
} from "@/lib/page-data";

export const metadata: Metadata = { title: "회원사 가입안내" };

export default async function Page() {
  /* 입금계좌·문의처는 관리자 화면(/admin/site)에서 고친다 */
  const site = await getSiteSettings();

  const contactRows = [
    { label: "입금계좌", value: site.joinBank },
    { label: "예금주", value: site.joinHolder },
    { label: "담당", value: site.joinTeam },
    { label: "주소", value: site.joinAddress },
  ].filter((row) => row.value);

  return (
    <PageShell
      href="/members/join"
      desc="클라우드컴퓨팅 관련 기업·기관·단체라면 조합에 참여할 수 있습니다."
    >
      {/*
        원본은 탭 3개였지만 서브메뉴 탭과 2단으로 겹치므로,
        한 페이지에 펴고 같은 구분으로 건너뛰는 목차만 둔다.
      */}
      <nav aria-label="가입안내 목차" className="flex flex-wrap gap-2">
        {JOIN_SECTIONS.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            {sec.label}
            <IconChevron className="size-3.5 rotate-90 text-ink-400 transition-colors group-hover:text-brand-500" />
          </a>
        ))}
      </nav>

      {/* 가입대상 · 회비 */}
      <section id={JOIN_SECTIONS[0].id} className="mt-11 scroll-mt-28 lg:scroll-mt-36">
        <SectionHeading
          eyebrow="회원가입 대상"
          title="가입대상 및 회비"
          desc="가입비와 연회비는 회원 구분에 따라 다르게 책정됩니다."
        />

        <div className="mt-10 rounded-xl border border-line bg-surface p-7 lg:p-9">
          <p className="data-line text-flame-600">{JOIN_TARGET.grade}</p>
          <p className="mt-3 text-lg leading-relaxed text-navy-900">{JOIN_TARGET.target}</p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <caption className="sr-only">회원 구분별 가입비 및 연회비</caption>
            <thead>
              <tr className="border-y-2 border-navy-900 bg-surface">
                <th scope="col" className="px-5 py-4 text-base font-bold text-navy-900">
                  구분
                </th>
                <th scope="col" className="px-5 py-4 text-base font-bold text-navy-900">
                  가입비
                </th>
                <th scope="col" className="px-5 py-4 text-base font-bold text-navy-900">
                  연회비
                </th>
              </tr>
            </thead>
            <tbody>
              {FEE_TABLE.map((f) => (
                <tr key={f.grade} className="border-b border-line">
                  <th scope="row" className="px-5 py-5 text-left text-md font-bold text-brand-600">
                    {f.grade}
                  </th>
                  <td className="px-5 py-5 text-md text-ink-900">{f.entry}</td>
                  <td className="px-5 py-5 text-md text-ink-900">{f.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 가입 특전 */}
      <section id={JOIN_SECTIONS[1].id} className="mt-11 scroll-mt-28 lg:scroll-mt-36">
        <SectionHeading eyebrow={`특전 ${MEMBER_BENEFITS.length}가지`} title="회원가입 특전" />

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {MEMBER_BENEFITS.map((b) => (
            <li key={b} className="flex gap-4 rounded-xl bg-surface px-6 py-5">
              <span className="mt-2.5 size-2 shrink-0 rounded-full bg-flame-500" aria-hidden />
              <p className="text-md leading-relaxed text-ink-900">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 가입절차 */}
      <section id={JOIN_SECTIONS[2].id} className="mt-11 scroll-mt-28 lg:scroll-mt-36">
        <SectionHeading
          eyebrow={`일반회원 ${JOIN_STEPS.length}단계`}
          title="가입절차"
          desc="관련서류를 제출하고 회비를 입금하면 조합 승인 후 회원번호가 부여됩니다."
        />
        <div className="mt-10">
          <StepFlow steps={JOIN_STEPS} />
        </div>
      </section>

      {/* 제출서류 · 입금계좌 */}
      <section className="mt-11 grid gap-12 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeading eyebrow={`서류 ${JOIN_DOCS.length}종`} title="가입 시 제출서류" />

          <ul className="mt-10 space-y-3">
            {JOIN_DOCS.map((doc) => (
              <li
                key={doc}
                className="flex items-start gap-3 border-b border-line pb-3 text-md leading-relaxed text-ink-600"
              >
                <span className="mt-2 grid size-4 shrink-0 place-items-center rounded-full bg-brand-100">
                  <span className="size-1.5 rounded-full bg-brand-600" />
                </span>
                {doc}
              </li>
            ))}
          </ul>

          <ul className="mt-6 space-y-2">
            {JOIN_DOC_NOTES.map((note) => (
              <li key={note} className="flex gap-2 text-base leading-relaxed text-ink-400">
                <span aria-hidden>※</span>
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading eyebrow="가입비 및 연회비" title="입금계좌 및 문의처" />

          <div className="mt-10">
            <DefTable
              rows={[
                ...contactRows,
                ...(site.joinTel || site.joinFax
                  ? [
                      {
                        label: "연락처",
                        value: (
                          <>
                            {site.joinTel && <>TEL. {site.joinTel}</>}
                            {site.joinTel && site.joinFax && (
                              <span className="mx-2 text-line">|</span>
                            )}
                            {site.joinFax && <>FAX. {site.joinFax}</>}
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(site.joinEmail
                  ? [
                      {
                        label: "이메일",
                        value: (
                          <a
                            href={`mailto:${site.joinEmail}`}
                            className="text-brand-600 hover:underline"
                          >
                            {site.joinEmail}
                          </a>
                        ),
                      },
                    ]
                  : []),
              ]}
            />

            <div className="mt-8">
              <Link
                href="/about/location"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
              >
                찾아오시는 길
                <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
