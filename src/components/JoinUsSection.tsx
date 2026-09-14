import Link from "next/link";
import CardIcon from "./CardIcon";
import { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";
import { IconArrow } from "./Icons";
import ProposalDialog from "./ProposalDialog";

/*
  메인의 '참여하기' 두 칸.

  둘 다 회원사안내·주요사업 화면 안에 있어서 그 화면까지 들어오는 사람이
  아니면 있는 줄도 모른다. 메인에서 바로 하게 낸다.

  바로 위 알림판(BannerRail)이 옅은 회색 바탕이라 같은 색을 쓰면 두 자리가
  한 덩어리로 보인다. 어두운 바탕으로 갈라 놓는다.

  카드 속은 알림판 카드와 같은 규칙으로 짠다 — 왼쪽에 그림 딱지, 오른쪽에 글,
  맨 아래에 화살표 달린 글자 단추. 네 칸이 두 칸으로 줄면서 칸이 두 배로
  넓어졌으므로, 글을 위에서 아래로 흘리지 않고 그림 옆에 붙여 폭을 쓴다.
*/
export default function JoinUsSection({ me = EMPTY_APPLICANT }: { me?: Applicant }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-12 lg:py-14">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/55"
        aria-hidden
      />
      <span className="absolute inset-x-0 top-0 h-1 bg-flame-500" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/*
          위 띄(BannerRail)와 같은 머리 줄이다 — 왼쪽에 제목, 오른쪽에 손잡이.
          여기 내는 두 것 말고도 뉴스레터·현황 조회가 있으므로 참여하기 화면으로 열어 둔다.
        */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-500">참여 · 신청</p>
            <h2 className="mt-3 text-2xl font-bold text-white lg:text-3xl">참여하기</h2>
            <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-brand-100/70">
              조합 사업에 함께하실 분들을 기다립니다.
            </p>
          </div>

          <Link
            href="/participate"
            className="group inline-flex items-center gap-2 text-base font-bold text-white transition-colors hover:text-flame-500"
          >
            참여 창구 모두 보기
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 칸이 좁아지면 그림 옆 글자리가 모자라므로 넓은 화면에서만 두 칸으로 나눈다 */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* 사업공고 — 임원사 담당자가 받아보는 주간 안내 */}
          <div className="flex rounded-xl bg-white p-6 lg:p-7">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <CardIcon name="notice" className="size-7" />
            </span>

            <div className="ml-4 flex min-w-0 flex-1 flex-col lg:ml-5">
              <p className="data-line text-brand-600">임원사 · 주 1회</p>
              <p className="mt-2 text-lg font-bold leading-snug text-navy-900">
                사업공고를 메일로 받아보세요
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-600">
                국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 정리해 매주 보내드립니다.
              </p>

              <div className="mt-auto pt-6">
                <Link
                  href="/members/notice"
                  className="group inline-flex items-center gap-2 text-base font-bold text-navy-900 transition-colors hover:text-brand-600"
                >
                  수신 신청
                  <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* 교육사업 — 밖에서 함께 하자고 들어오는 제안 */}
          <div className="flex rounded-xl bg-white p-6 lg:p-7">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <CardIcon name="education" className="size-7" />
            </span>

            <div className="ml-4 flex min-w-0 flex-1 flex-col lg:ml-5">
              <p className="data-line text-brand-600">교육사업 협력</p>
              <p className="mt-2 text-lg font-bold leading-snug text-navy-900">
                함께 교육과정을 열어보세요
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-600">
                대학·교육기관·회원사와 함께 클라우드·AI 인프라 과정을 운영하고 있습니다. 협력
                방안을 제안해 주세요.
              </p>

              <div className="mt-auto pt-6">
                <ProposalDialog tone="text" label="제안하기" me={me} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
