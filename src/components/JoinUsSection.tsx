import Link from "next/link";
import { IconArrow } from "./Icons";
import ProposalDialog from "./ProposalDialog";

/*
  메인의 '참여하기' 두 칸.

  사업공고 수신과 교육사업 제안은 각각 회원사안내·주요사업 화면 안에 있는데,
  그 화면까지 들어오는 사람이 많지 않다. 메인에서 바로 신청할 수 있게 낸다.
*/
export default function JoinUsSection() {
  return (
    <section className="bg-surface py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">참여하기</h2>
          <p className="text-base text-ink-600">조합 사업에 함께하실 분들을 기다립니다.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* 사업공고 — 임원사 담당자가 받아보는 주간 안내 */}
          <div className="flex flex-col rounded-2xl border border-line bg-white p-8 lg:p-10">
            <span className="block h-1 w-10 rounded-full bg-brand-500" aria-hidden />
            <p className="data-line mt-6 text-brand-600">임원사 · 주 1회</p>
            <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
              사업공고를 메일로 받아보세요
            </p>
            <p className="mt-3 text-md leading-relaxed text-ink-600">
              국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 정리해 매주 보내드립니다.
            </p>

            <div className="mt-8">
              <Link
                href="/members/notice"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
              >
                수신 신청
                <IconArrow className="size-4" />
              </Link>
            </div>
          </div>

          {/* 교육사업 — 밖에서 함께 하자고 들어오는 제안 */}
          <div className="flex flex-col rounded-2xl border border-line bg-white p-8 lg:p-10">
            <span className="block h-1 w-10 rounded-full bg-flame-500" aria-hidden />
            <p className="data-line mt-6 text-flame-600">교육사업 협력</p>
            <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
              조합과 함께 교육과정을 열어보세요
            </p>
            <p className="mt-3 text-md leading-relaxed text-ink-600">
              대학·교육기관·회원사와 함께 클라우드·AI 인프라 과정을 운영하고 있습니다. 협력 방안을
              제안해 주세요.
            </p>

            <div className="mt-8">
              <ProposalDialog />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
