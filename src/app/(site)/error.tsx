"use client";

import Link from "next/link";

/*
  사이트 쪽 오류 화면.

  이것이 없으면 화면 하나가 잘못돼도 global-error 로 넘어가 헤더·푸터까지
  사라진 맨 화면이 뜬다. 여기에 두면 껍데기는 남고 본문 자리만 바뀌므로,
  보던 사람이 메뉴로 다른 곳에 갈 수 있다.
*/
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20 text-center lg:py-28">
      <p className="data-line text-flame-600">일시적인 문제</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-900 lg:text-3xl">
        화면을 불러오지 못했습니다
      </h1>
      <p className="mt-5 text-md leading-relaxed text-ink-600">
        잠시 뒤에 다시 시도해 주세요. 계속 같은 화면이 나오면 사무국으로 알려 주시면
        고치겠습니다.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 text-base font-bold text-navy-900 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
