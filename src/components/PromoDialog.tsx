"use client";

import PrefilledNote from "./PrefilledNote";

import Link from "next/link";

import { EMPTY_APPLICANT, type Applicant } from "@/lib/applicant-types";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconClose } from "./Icons";
import ConsentCheck from "./ConsentCheck";
import { submitPromo, type PromoState } from "@/lib/db/promo-actions";
import { CADENCES, MIN_PROMO_BODY } from "@/lib/promo-types";

const input =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";
const fileInput =
  "w-full cursor-pointer rounded-md border border-line bg-white px-4 py-2.5 text-base text-ink-600 outline-none transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white focus:border-brand-500";

/*
  홍보 서비스 신청 팝업.

  그림과 첨부는 미리 올리지 않고 이 폼과 함께 한 번에 보낸다.
  로그인 없이 쓰는 창구라 파일만 따로 받는 자리를 열어 두지 않으려는 것이다.
*/
export default function PromoDialog({ me = EMPTY_APPLICANT }: { me?: Applicant }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<PromoState, FormData>(submitPromo, {});
  /* 몇 자를 더 써야 하는지 적어 준다. 다 쓰고 나서 퇴짜 맞지 않도록. */
  const [bodyLength, setBodyLength] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
      >
        홍보 신청하기
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(760px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60 open:flex open:max-h-[88vh] open:flex-col"
        aria-label="홍보 서비스 신청"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-7 py-5">
          <div>
            <p className="data-line text-flame-600">홍보 서비스</p>
            <p className="mt-1.5 text-lg font-bold text-navy-900">
              조합 회원사·기관에 알려드립니다
            </p>
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
              {state.ref && (
                <div className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 text-left">
                  <p className="text-sm text-ink-400">접수번호</p>
                  <p className="label-mono mt-0.5 text-lg font-bold text-navy-900">{state.ref}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {state.mailed && "확인 메일을 보내드렸습니다. "}이 번호로{" "}
                    <Link href="/participate/status" className="font-bold text-brand-600 underline underline-offset-2">
                      신청 현황
                    </Link>
                    을 확인하실 수 있습니다.
                  </p>
                </div>
              )}
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
                조합이 가진 회원사·기관 명단으로 제품·서비스·교육·행사를 알려드립니다. 아래
                내용을 남겨 주시면 사무국에서 검토한 뒤 일정과 방식을 안내해 드립니다.
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

              {/* 신청자 */}
              <PrefilledNote me={me} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    기관 · 회사명
                  </span>
                  <input name="org" required defaultValue={me.org} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">신청자</span>
                  <input name="name" required defaultValue={me.name} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    직급 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input name="position" placeholder="팀장" className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">이메일</span>
                  <input name="email" type="email" required defaultValue={me.email} className={input} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    연락처 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input name="tel" className={input} />
                </label>
              </div>

              {/* 홍보 내용 */}
              <label className="block border-t border-line pt-4">
                <span className="mb-1.5 block text-base font-bold text-navy-900">홍보 제목</span>
                <input
                  name="subject"
                  required
                  placeholder="예) 클라우드 백업 솔루션 신규 출시"
                  className={input}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-base font-bold text-navy-900">
                  홍보 내용 <span className="font-medium text-ink-400">({MIN_PROMO_BODY}자 이상)</span>
                </span>
                <textarea
                  name="body"
                  rows={6}
                  required
                  minLength={MIN_PROMO_BODY}
                  onChange={(e) => setBodyLength(e.target.value.trim().length)}
                  placeholder="알리고 싶은 제품·서비스·교육·행사의 내용을 적어 주세요."
                  className={`${input} leading-relaxed`}
                />
                <span className="mt-1.5 block text-sm text-ink-400">
                  {bodyLength >= MIN_PROMO_BODY
                    ? `${bodyLength}자`
                    : `${bodyLength}자 · ${MIN_PROMO_BODY - bodyLength}자 더 필요합니다`}
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-base font-bold text-navy-900">
                  홍보 문구 <span className="font-medium text-ink-400">(선택)</span>
                </span>
                <input
                  name="tagline"
                  placeholder="배너나 메일 제목에 그대로 쓸 한 줄"
                  className={input}
                />
                <span className="mt-1.5 block text-sm text-ink-400">
                  비워 두시면 사무국에서 내용에 맞게 정합니다.
                </span>
              </label>

              {/* 일정 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">홍보 희망일</span>
                  <input name="startOn" type="date" required min={today} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">홍보 주기</span>
                  <select name="cadence" defaultValue="once" className={input}>
                    {CADENCES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* 자료 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    홍보 이미지 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className={fileInput}
                  />
                  <span className="mt-1.5 block text-sm text-ink-400">JPG · PNG · GIF · WEBP, 5MB 이하</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-base font-bold text-navy-900">
                    첨부파일 <span className="font-medium text-ink-400">(선택)</span>
                  </span>
                  <input name="file" type="file" className={fileInput} />
                  <span className="mt-1.5 block text-sm text-ink-400">
                    소개서·제안서 등, 10MB 이하
                  </span>
                </label>
              </div>

              <ConsentCheck
                items="기관·회사명, 신청자 성명, 이메일주소, 홍보 제목 및 내용, 홍보 희망일 (선택: 직급, 연락처, 홍보 문구, 이미지, 첨부파일)"
                purpose="홍보 진행 여부 검토, 일정·방식 안내"
                keep="처리 완료일부터 1년"
              />

              {state.error && (
                <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
                  {state.error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <p className="text-sm leading-relaxed text-ink-400">
                  적어 주신 정보는 홍보 검토와 회신에만 씁니다.
                </p>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {pending ? "보내는 중…" : "홍보 신청"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
