"use client";

import Link from "next/link";

/*
  관리자 쪽 오류 화면.

  사무국이 보는 곳이라 사이트 쪽과 말을 다르게 한다. 무엇이 잘못됐는지
  짐작할 거리를 주고, 사이드바가 남아 있으니 다른 일을 이어갈 수 있다.
*/
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-white p-8 lg:p-10">
      <p className="data-line text-flame-600">오류</p>
      <h1 className="mt-3 text-2xl font-bold text-navy-900">화면을 불러오지 못했습니다</h1>
      <p className="mt-4 text-md leading-relaxed text-ink-600">
        방금 한 일을 다시 해 보시고, 그래도 같으면 아래 내용을 알려 주세요.
      </p>

      {/* 사무국이 그대로 옮겨 적을 수 있게 오류 문구를 보여 준다 */}
      <p className="label-mono mt-5 break-all rounded-lg bg-surface px-4 py-3 text-ink-600">
        {error.message || "알 수 없는 오류"}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-navy-900 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          다시 시도
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-line px-5 py-2.5 text-base font-bold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          대시보드로
        </Link>
      </div>
    </div>
  );
}
