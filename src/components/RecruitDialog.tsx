"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrow, IconClip, IconClose } from "./Icons";
import { fileKind, IconDownload, isHtml } from "./board/post-bits";
import type { PostDetail } from "@/lib/db/posts";
import { formatApplyPeriod, formatBytes } from "@/lib/format";

/*
  메인 참여하기의 강사 모집 팝업.

  지원은 글에 적힌 방법(메일·양식)으로 받으므로, 메인을 떠나지 않고 모집 글을 그 자리에서
  읽고 지원서 양식까지 내려받게 한다. 교육사업 제안(ProposalDialog)과 같은 <dialog> 라
  Esc 닫기·초점 가두기는 브라우저에 맡긴다.
  모집중인 글이 여럿이면 창 위쪽에서 하나씩 골라 본다. 본문은 저장할 때 걸러 둔 HTML 이다.
*/
export default function RecruitDialog({ posts, className }: { posts: PostDetail[]; className: string }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);
  const post = posts[picked] ?? posts[0];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!post) return null;
  const period = formatApplyPeriod(post.event.applyFrom, post.event.applyBy);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        모집 공고 보기
        <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(760px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60 open:flex open:max-h-[88vh] open:flex-col"
        aria-label="강사 모집"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-7 py-5">
          <div>
            <p className="data-line text-flame-600">강사 모집 · 모집중 {posts.length}건</p>
            <p className="mt-1.5 text-lg font-bold text-navy-900">조합 교육의 강사를 모집합니다</p>
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

        {posts.length > 1 && (
          /* 모집 글 고르기. 고른 글은 남색으로 */
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-line bg-white px-7 py-3">
            {posts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPicked(i)}
                aria-pressed={i === picked}
                className={`max-w-[16rem] shrink-0 truncate rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  i === picked
                    ? "bg-navy-900 text-white"
                    : "bg-surface text-ink-600 hover:bg-brand-50 hover:text-navy-900"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-7 py-6">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-flame-500 px-2.5 py-0.5 text-sm font-bold text-white">모집중</span>
            {post.category && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-700">
                {post.category}
              </span>
            )}
          </p>
          <h3 className="mt-3 text-xl font-bold leading-snug text-navy-900">{post.title}</h3>
          {period && (
            <p className="mt-2 text-base text-ink-600">
              <span className="font-semibold text-navy-900">모집 기간</span>{" "}
              <span className="tabular-nums">{period}</span>
            </p>
          )}

          {post.attachments.length > 0 && (
            <section aria-label="첨부파일" className="mt-6">
              <p className="mb-2 flex items-center gap-1.5 text-base font-bold text-navy-900">
                <IconClip className="size-4 text-ink-400" />
                첨부파일
                <span className="text-brand-600">{post.attachments.length}</span>
              </p>
              <ul className="space-y-2">
                {post.attachments.map((a) => {
                  const kind = fileKind(a.filename);
                  return (
                    <li key={a.id}>
                      <a
                        href={`/api/attachments/${a.id}`}
                        className="group flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-2.5 transition-colors hover:border-brand-500 hover:bg-brand-50/40"
                      >
                        <span
                          className={`grid h-9 w-10 shrink-0 place-items-center rounded-md text-xs font-bold ${kind.tone}`}
                        >
                          {kind.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 text-base font-semibold text-navy-900 [overflow-wrap:anywhere] group-hover:text-brand-600">
                            {a.filename}
                          </span>
                          <span className="label-mono text-sm text-ink-400">{formatBytes(a.byteSize)}</span>
                        </span>
                        <IconDownload className="size-5 shrink-0 text-brand-600" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {post.body &&
            (isHtml(post.body) ? (
              <div className="rich-text mt-6 border-t border-line pt-6" dangerouslySetInnerHTML={{ __html: post.body }} />
            ) : (
              <p className="mt-6 whitespace-pre-line border-t border-line pt-6 text-base leading-relaxed text-ink-700">
                {post.body}
              </p>
            ))}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-7 py-4">
          <Link
            href="/participate/instructors"
            className="text-base font-semibold text-ink-600 hover:text-navy-900"
          >
            지난 모집까지 모두 보기
          </Link>
          <Link
            href={`/participate/instructors/${post.id}`}
            className="group inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            글 화면에서 보기
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </dialog>
    </>
  );
}
