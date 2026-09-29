import Link from "next/link";
import { IconArrow } from "@/components/Icons";

/*
  사업공고 목록 위에 두는 구독 안내.

  공고는 매주 새로 올라오는데, 사이트를 날마다 들여다보는 분은 없다.
  공고를 보러 온 사람이 지금 이 자리에 있을 때 알려 주는 것이 가장 잘 닿는다.
  지금은 회원사안내 메뉴 안쪽에 있어 창구가 있는 줄 아는 사람만 찾아간다.

  뉴스레터 화면이 같은 자리에서 같은 일을 한다(NewsletterSubscribe).
*/
export default function AnnounceSubscribe() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-6 py-5">
      <p className="text-md leading-relaxed text-ink-600">
        <b className="font-bold text-navy-900">새 공고를 메일로 받아보시겠어요?</b>
        <br className="sm:hidden" />
        <span className="sm:ml-2">사무국이 매주 모아 담당자 메일함으로 보내드립니다.</span>
      </p>
      <Link
        href="/members/notice"
        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-navy-900"
      >
        수신 신청
        <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
