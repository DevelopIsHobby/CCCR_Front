import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = { title: "참여하기" };

const SERVICES = [
  {
    href: "/members/notice",
    eyebrow: "임원사 · 주 1회",
    title: "사업공고 수신신청",
    desc: "국가 연구개발과제와 정부·유관기관 공모 공고를 사무국이 정리해 매주 보내드립니다.",
  },
  {
    href: "/participate/room",
    eyebrow: "대회의실 · 소회의실",
    title: "회의실 예약",
    desc: "조합 사무국의 회의실을 회원사와 유관기관에 빌려드립니다.",
  },
  {
    href: "/participate/proposal",
    eyebrow: "대학 · 교육기관 · 회원사",
    title: "교육사업 제안",
    desc: "함께 열고 싶은 교육과정이나 협력 방안을 제안해 주세요.",
  },
  {
    href: "/info/newsletter",
    eyebrow: "월 1회",
    title: "뉴스레터 신청",
    desc: "공지·행사·기술동향을 한 달에 한 번 정리해 보내드립니다.",
  },
  {
    href: "/participate/promo",
    eyebrow: "회원사 · 유관기관",
    title: "홍보 서비스 신청",
    desc: "제품·서비스·교육·행사 소식을 조합 명단으로 알려드립니다.",
  },
];

export default function Page() {
  return (
    <PageShell href="/participate" desc="조합 사업에 함께하실 분들을 기다립니다.">
      <SectionHeading
        eyebrow="참여 · 신청"
        title="참여하기"
        desc="조합이 회원사·유관기관과 함께 운영하는 창구입니다. 로그인 없이도 신청하실 수 있고, 넣으신 뒤에는 접수번호로 진행 상황을 확인하실 수 있습니다."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.4)]"
          >
            <p className="data-line text-brand-600">{s.eyebrow}</p>
            <p className="mt-2.5 text-xl font-bold text-navy-900">{s.title}</p>
            <p className="mt-2 text-md leading-relaxed text-ink-600">{s.desc}</p>
            <span className="mt-auto flex items-center gap-2 pt-6 text-base font-bold text-navy-900 transition-colors group-hover:text-brand-600">
              신청하러 가기
              <IconArrow className="size-4" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-11 rounded-xl border border-line bg-surface p-6 lg:p-8">
        <h3 className="text-xl font-bold text-navy-900">이미 신청하셨나요?</h3>
        <p className="mt-2 text-md leading-relaxed text-ink-600">
          접수 확인 메일에 적힌 접수번호로 진행 상황을 확인하실 수 있습니다. 로그인하시면
          접수번호 없이도 넣으신 신청이 모두 보입니다.
        </p>
        <Link
          href="/participate/status"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          신청 현황 조회
          <IconArrow className="size-4" />
        </Link>
      </section>
    </PageShell>
  );
}
