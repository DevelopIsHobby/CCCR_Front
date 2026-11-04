import Link from "next/link";
import CardIcon from "./CardIcon";
import { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";
import { IconArrow } from "./Icons";
import ProposalDialog from "./ProposalDialog";
import RecruitDialog from "./RecruitDialog";
import type { PostDetail } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

/*
  메인의 '참여하기' 세 칸 — 사업공고 메일, 교육사업 제안, 강사 모집.

  셋 다 회원사안내·주요사업·참여하기 화면 안에 있어서 그 화면까지 들어오는 사람이
  아니면 있는 줄도 모른다. 메인에서 바로 하게 낸다.

  위아래 남색 띠가 한 벌로 읽히게 바탕은 메인 맨 위 슬라이드 띠와 똑같이 맞춘다(Hero.tsx).

  두 칸일 때는 그림 딱지 | 글 | 단추를 가로 한 줄로 두었다. 세 칸으로 늘면서 칸 폭이
  400px 남짓으로 줄어 글이 너무 좁게 접힌다. 딱지·작은 머리를 위에, 제목·설명을 가운데,
  단추를 맨 아래에 세로로 두고 단추 줄을 칸끼리 맞춘다(mt-auto).
*/
export default function JoinUsSection({
  me = EMPTY_APPLICANT,
  recruits = [],
}: {
  me?: Applicant;
  /** 지금 모집중인 강사 모집 글(본문·첨부까지). 마감이 가까운 차례 */
  recruits?: PostDetail[];
}) {
  const first = recruits[0];

  return (
    <section className="relative overflow-hidden bg-navy-900 py-12 lg:py-14">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/70"
        aria-hidden
      />
      <span className="absolute inset-x-0 top-0 h-1 bg-flame-500" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/*
          위 띠들과 같은 머리 줄이다 — 왼쪽에 제목, 오른쪽에 손잡이.
          여기 내는 것 말고도 뉴스레터·현황 조회가 있으므로 참여하기 화면으로 열어 둔다.
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

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 사업공고 — 신청한 담당자가 받아보는 주간 안내 */}
          <JoinCard
            icon={<CardIcon name="notice" className="size-6" />}
            eyebrow="주 1회 발송"
            title="사업공고를 메일로 받아보세요"
            action={
              <Link href="/members/notice" className={BUTTON}>
                수신 신청
                <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          >
            국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 정리해 매주 보내드립니다.
          </JoinCard>

          {/* 교육사업 — 밖에서 함께 하자고 들어오는 제안 */}
          <JoinCard
            icon={<CardIcon name="education" className="size-6" />}
            eyebrow="교육사업 협력"
            title="함께 교육과정을 열어보세요"
            action={<ProposalDialog label="제안하기" me={me} />}
          >
            대학·교육기관·회원사와 함께 클라우드·AI 인프라 과정을 운영하고 있습니다.
          </JoinCard>

          {/*
            강사 모집 — 모집중인 글이 있으면 마감이 가장 가까운 글을 바로 보여 주고,
            단추를 누르면 메인을 떠나지 않고 팝업으로 모집 글·지원서 양식을 본다(RecruitDialog).
            모집중인 글이 없으면 강사 모집 목록으로 보낸다.
          */}
          <JoinCard
            icon={<IconPresenter className="size-6" />}
            eyebrow={recruits.length > 0 ? `모집중 ${recruits.length}건` : "교육 · 세미나"}
            title="조합 교육의 강사가 되어 주세요"
            action={
              first ? (
                <RecruitDialog posts={recruits} className={BUTTON} />
              ) : (
                <Link href="/participate/instructors" className={BUTTON}>
                  강사 모집 보기
                  <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )
            }
          >
            {first ? (
              <>
                <span className="line-clamp-2 font-semibold text-navy-900">{first.title}</span>
                <span className="mt-1 block text-sm text-ink-400">
                  {first.category && `${first.category} · `}
                  {first.event.applyBy && `${formatDate(first.event.applyBy)} 마감`}
                </span>
              </>
            ) : (
              "클라우드·AI 교육과정과 세미나에서 강의하실 분을 모집할 때 이곳에 알려 드립니다."
            )}
          </JoinCard>
        </div>
      </div>
    </section>
  );
}

const BUTTON =
  "group inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600";

function JoinCard({
  icon,
  eyebrow,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  action: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-white p-6 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <p className="data-line text-brand-600">{eyebrow}</p>
      </div>
      <p className="mt-5 text-lg font-bold leading-snug text-navy-900">{title}</p>
      <div className="mt-2 text-base leading-relaxed text-ink-600">{children}</div>
      <div className="mt-auto pt-6">{action}</div>
    </div>
  );
}

/* 강단에 선 사람 — 강사. CardIcon 과 같은 규칙(24 격자·1.5 선) */
function IconPresenter({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="6" r="2.5" />
      <path d="M3.5 20v-4.5A4.5 4.5 0 0 1 8 11h1.5l4-3" />
      <path d="M13 4h7.5v8H13" />
      <path d="M14 20h6M17 20v-5" />
    </svg>
  );
}
