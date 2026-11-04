"use client";

import { useState } from "react";
import { IconArrow, IconMail } from "./Icons";
import { RECRUIT_EMAIL, RECRUIT_MAILTO } from "@/lib/recruit";

/*
  강사 모집 메일 칸 — 주소·주소 복사·메일 보내기.
  메인 팝업(RecruitDialog)과 참여하기 → 강사 모집 화면이 함께 쓴다.
*/
export default function RecruitContact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(RECRUIT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 복사가 막힌 브라우저에서는 주소를 보고 적으면 된다 */
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3.5">
        <IconMail className="size-5 shrink-0 text-brand-600" />
        {/* 주소는 잘리면 안 된다. 좁은 화면에서는 글자를 줄이고, 그래도 넘치면 줄을 넘긴다 */}
        <span className="min-w-0 flex-1 text-base font-bold text-navy-900 [overflow-wrap:anywhere] sm:text-md">
          {RECRUIT_EMAIL}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded px-2.5 py-1 text-sm font-semibold text-ink-600 transition-colors hover:bg-white hover:text-navy-900"
        >
          {copied ? "복사됨" : "주소 복사"}
        </button>
      </div>

      <a
        href={RECRUIT_MAILTO}
        className="group mt-5 flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
      >
        메일 보내기
        <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
}
