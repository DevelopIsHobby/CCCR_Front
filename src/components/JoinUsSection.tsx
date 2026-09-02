import Link from "next/link";
import { IconArrow } from "./Icons";
import ProposalDialog from "./ProposalDialog";
import RoomBookingDialog from "./RoomBookingDialog";

/*
  메인의 '참여하기' 세 칸.

  세 가지 모두 회원사안내·주요사업 화면 안에 있거나 아예 메뉴가 없어서
  그 화면까지 들어오는 사람이 아니면 있는 줄도 모른다. 메인에서 바로 하게 낸다.

  바로 위 알림판(BannerRail)이 옅은 회색 바탕이라 같은 색을 쓰면 두 자리가
  한 덩어리로 보인다. 어두운 바탕으로 갈라 놓는다.
*/
export default function JoinUsSection() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-16 lg:py-20">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/55"
        aria-hidden
      />
      <div
        className="absolute -right-40 top-0 size-[520px] rounded-full bg-brand-500/15 blur-3xl"
        aria-hidden
      />
      <span className="absolute inset-x-0 top-0 h-1 bg-flame-500" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="data-line text-flame-500">참여 · 신청</p>
            <h2 className="mt-3 text-2xl font-bold text-white lg:text-3xl">참여하기</h2>
          </div>
          <p className="text-base text-brand-100/70">조합 사업에 함께하실 분들을 기다립니다.</p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {/* 사업공고 — 임원사 담당자가 받아보는 주간 안내 */}
          <div className="flex flex-col rounded-2xl bg-white p-8">
            <span className="block h-1 w-10 rounded-full bg-brand-500" aria-hidden />
            <p className="data-line mt-6 text-brand-600">임원사 · 주 1회</p>
            <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
              사업공고를 메일로 받아보세요
            </p>
            <p className="mt-3 text-md leading-relaxed text-ink-600">
              국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 정리해 매주 보내드립니다.
            </p>

            <div className="mt-auto pt-8">
              <Link
                href="/members/notice"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
              >
                수신 신청
                <IconArrow className="size-4" />
              </Link>
            </div>
          </div>

          {/* 회의실 — 메뉴 없이 여기서만 연다 */}
          <div className="flex flex-col rounded-2xl bg-white p-8">
            <span className="block h-1 w-10 rounded-full bg-navy-900" aria-hidden />
            <p className="data-line mt-6 text-navy-800">대회의실 · 소회의실</p>
            <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
              회의실을 빌려드립니다
            </p>
            <p className="mt-3 text-md leading-relaxed text-ink-600">
              조합 회의실을 이용하실 수 있습니다. 날짜와 시간을 고르시면 잡힌 일정을 함께
              보여드립니다.
            </p>

            <div className="mt-auto pt-8">
              <RoomBookingDialog />
            </div>
          </div>

          {/* 교육사업 — 밖에서 함께 하자고 들어오는 제안 */}
          <div className="flex flex-col rounded-2xl bg-white p-8">
            <span className="block h-1 w-10 rounded-full bg-flame-500" aria-hidden />
            <p className="data-line mt-6 text-flame-600">교육사업 협력</p>
            <p className="mt-3 text-xl font-bold leading-snug text-navy-900">
              함께 교육과정을 열어보세요
            </p>
            <p className="mt-3 text-md leading-relaxed text-ink-600">
              대학·교육기관·회원사와 함께 클라우드·AI 인프라 과정을 운영하고 있습니다. 협력 방안을
              제안해 주세요.
            </p>

            <div className="mt-auto pt-8">
              <ProposalDialog />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
