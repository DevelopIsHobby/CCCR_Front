"use client";

import { useState } from "react";
import LegalDialog from "./LegalDialog";

/*
  개인정보 수집·이용 동의.

  네 창구와 뉴스레터가 함께 쓴다. 창구마다 받는 칸이 다르므로 무엇을 받아
  어디에 쓰고 얼마나 두는지를 각자 적어 넘긴다. "방침에 따릅니다" 한 줄로는
  무엇에 동의하는지 알 수 없기 때문이다.

  전문보기 단추는 라벨 밖에 둔다. 라벨 안에 있으면 눌렀을 때 동의 체크가
  함께 켜진다.
*/
export default function ConsentCheck({
  items,
  purpose,
  keep,
  compact = false,
  tone = "light",
}: {
  /** 수집하는 칸. 예) "기관명, 성명, 이메일주소" */
  items: string;
  /** 쓰는 목적. 예) "회의실 예약 접수와 확정 안내" */
  purpose: string;
  /** 보유기간. 예) "이용일부터 1년" */
  keep: string;
  /** 좁은 자리(메인 띠)에서는 한 줄로 줄인다 */
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);

  const linkClass =
    tone === "dark"
      ? "shrink-0 text-sm font-bold text-brand-200 underline underline-offset-2 hover:text-white"
      : "shrink-0 text-sm font-bold text-brand-600 underline underline-offset-2 hover:text-brand-700";
  const textClass = tone === "dark" ? "text-brand-100/80" : "text-ink-600";

  return (
    <>
      <div
        className={
          compact
            ? "flex flex-wrap items-center gap-x-2 gap-y-1"
            : `rounded-lg px-5 py-4 ${tone === "dark" ? "bg-white/10" : "bg-surface"}`
        }
      >
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="agreePrivacy"
            required
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-600"
          />
          <span className={`text-base font-bold ${tone === "dark" ? "text-white" : "text-navy-900"}`}>
            개인정보 수집·이용에 동의합니다 <span className="text-flame-600">(필수)</span>
          </span>
        </label>

        {!compact && (
          <ul className={`mt-2.5 space-y-1 pl-6.5 text-sm leading-relaxed ${textClass}`}>
            <li>수집 항목 : {items}</li>
            <li>이용 목적 : {purpose}</li>
            <li>보유 기간 : {keep}</li>
            <li>동의를 거부하실 수 있으나, 그 경우 신청을 접수할 수 없습니다.</li>
          </ul>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${linkClass} ${compact ? "" : "mt-2.5 block"}`}
        >
          전문 보기
        </button>
      </div>

      <LegalDialog
        open={open}
        tab="privacy"
        tabs={["privacy"]}
        onTabChange={() => {}}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
