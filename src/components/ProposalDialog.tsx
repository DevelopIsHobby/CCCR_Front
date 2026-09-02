"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconClose } from "./Icons";
import { submitProposal, type ProposalState } from "@/lib/db/outreach-actions";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

/*
  교육사업 제안 팝업.
  조합과 함께 교육을 열고 싶은 기관·기업이 제안을 넣는 창구다.
  별도 화면을 만들면 찾아오기 어려워, 주요사업 화면에서 바로 열리게 한다.
  <dialog> 를 써서 ESC 닫기와 초점 가두기를 브라우저에 맡긴다.
*/
export default function ProposalDialog({
  tone = "light",
  label = "교육사업 제안하기",
}: {
  tone?: "light" | "dark";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<ProposalState, FormData>(submitProposal, {});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const buttonClass =
    tone === "dark"
      ? "inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold text-navy-900 transition-colors hover:bg-brand-50"
      : "inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        {label}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(720px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60 open:flex open:max-h-[88vh] open:flex-col"
        aria-label="교육사업 제안"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-7 py-5">
          <div>
            <p className="data-line text-flame-600">교육사업</p>
            <p className="mt-1.5 text-lg font-bold text-navy-900">함께 하실 제안을 기다립니다</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white hover:text-navy-900"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-7 py-7">
          {state.ok ? (
            <div className="py-10 text-center">
              <p className="text-lg font-bold text-navy-900">{state.ok}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-7 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
              >
                닫기
              </button>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <p className="text-base leading-relaxed text-ink-600">
                조합은 클라우드·AI 인프라 분야의 교육과정을 회원사·대학·교육기관과 함께
                운영하고 있습니다. 함께 하실 과정이나 협력 방안을 알려 주시면 사무국에서 검토 후
                연락드리겠습니다.
              </p>

              {/* 사람은 보지 못하는 칸. 자동 입력을 거르는 데 쓴다. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    기관 · 기업명
                  </span>
                  <input name="org" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">담당자</span>
                  <input name="name" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
                  <input name="email" type="email" required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    연락처 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input name="tel" className={input} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-base font-bold text-navy-900">제안 제목</span>
                <input
                  name="subject"
                  required
                  placeholder="예) 클라우드 보안 실무과정 공동 운영 제안"
                  className={input}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-base font-bold text-navy-900">제안 내용</span>
                <textarea
                  name="body"
                  rows={7}
                  required
                  placeholder="과정 주제, 대상, 기간, 협력 형태 등을 적어 주세요."
                  className={`${input} leading-relaxed`}
                />
              </label>

              {state.error && (
                <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
                  {state.error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <p className="text-sm leading-relaxed text-ink-400">
                  적어 주신 정보는 제안 검토와 회신에만 씁니다.
                </p>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {pending ? "보내는 중…" : "제안 보내기"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
