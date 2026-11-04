"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrow, IconClose, IconMail } from "./Icons";

/*
  메인 참여하기의 강사 모집 팝업.

  모집 글을 따로 쌓지 않는다. 지원할 분은 이력서를 담당자 메일로 보내면 되므로,
  창에는 그 안내와 메일 주소만 둔다(사무국 결정). 교육사업 제안(ProposalDialog)과 같은
  <dialog> 라 Esc 닫기·초점 가두기는 브라우저에 맡긴다.
*/
const RECRUIT_EMAIL = "mskim@cccr.or.kr";

export default function RecruitDialog({ className }: { className: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        지원 안내
        <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(480px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60"
        aria-label="강사 모집"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <p className="data-line text-flame-600">강사 모집</p>
            <p className="mt-1.5 text-lg font-bold text-navy-900">조합 교육의 강사가 되어 주세요</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-surface hover:text-navy-900"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <div className="px-7 pb-7 pt-4">
          <p className="text-base leading-relaxed text-ink-600">
            조합 교육·세미나에서 강의해 주실 분은 이력서를 아래 메일로 보내 주세요.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-lg bg-surface px-4 py-3.5">
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
            href={`mailto:${RECRUIT_EMAIL}?subject=${encodeURIComponent("[강사 지원] ")}`}
            className="group mt-5 flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            메일 보내기
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </dialog>
    </>
  );
}
