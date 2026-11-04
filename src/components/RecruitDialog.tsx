"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrow, IconClose } from "./Icons";
import RecruitContact from "./RecruitContact";
import { RECRUIT_NOTE } from "@/lib/recruit";

/*
  메인 참여하기의 강사 모집 팝업.

  모집 글을 따로 쌓지 않는다. 상시 모집이고 이력서는 담당자 메일로 받으므로, 창에는 그 안내와
  메일 주소만 둔다(lib/recruit.ts). 같은 안내가 참여하기 → 강사 모집 화면에도 있다.
  교육사업 제안(ProposalDialog)과 같은 <dialog> 라 Esc 닫기·초점 가두기는 브라우저에 맡긴다.
*/
export default function RecruitDialog({ className }: { className: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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
            <p className="flex items-center gap-2">
              <span className="data-line text-flame-600">강사 모집</span>
              <span className="rounded-full bg-flame-500 px-2.5 py-0.5 text-xs font-bold text-white">
                상시 모집
              </span>
            </p>
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
          <p className="mb-5 text-base leading-relaxed text-ink-600">{RECRUIT_NOTE}</p>
          <RecruitContact />
        </div>
      </dialog>
    </>
  );
}
