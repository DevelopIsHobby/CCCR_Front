"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPost, updatePost, type PostFormState } from "@/lib/db/post-actions";
import { formatBytes } from "@/lib/format";
import RichTextEditor from "./RichTextEditor";
import type { Attachment, EventInfo, PostLink } from "@/lib/db/posts";

type Props = {
  board: string;
  listPath: string;
  /** 행사정보처럼 주최·장소·일시를 함께 받는 게시판인가 */
  hasEventFields?: boolean;
  post?: {
    id: number;
    title: string;
    body: string;
    isPinned: boolean;
    isLocked: boolean;
    attachments: Attachment[];
    event?: EventInfo;
    link?: PostLink | null;
  };
};

const fieldClass =
  "w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

export default function PostForm({ board, listPath, hasEventFields = false, post }: Props) {
  const isEdit = Boolean(post);
  const [state, action, pending] = useActionState<PostFormState, FormData>(
    isEdit ? updatePost : createPost,
    {},
  );

  return (
    <form action={action} className="mt-10">
      <input type="hidden" name="board" value={board} />
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="space-y-6 border-t-2 border-navy-900 pt-8">
        <div>
          <label htmlFor="post-title" className="mb-2 block text-base font-bold text-navy-900">
            제목
          </label>
          <input
            id="post-title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={post?.title}
            placeholder="제목을 입력하세요"
            className={fieldClass}
          />
        </div>

        <div>
          <span className="mb-2 block text-base font-bold text-navy-900">내용</span>
          <RichTextEditor name="body" defaultValue={post?.body ?? ""} />
        </div>

        {/* 본문 안 하이퍼링크와 별개로, 글에 함께 걸어 두는 링크 한 줄 */}
        <div>
          <label htmlFor="post-link" className="mb-2 block text-base font-bold text-navy-900">
            링크
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
            <input
              id="post-link"
              name="linkUrl"
              type="url"
              inputMode="url"
              defaultValue={post?.link?.url ?? ""}
              placeholder="https://example.com/article"
              className={fieldClass}
            />
            <input
              name="linkLabel"
              type="text"
              maxLength={40}
              defaultValue={post?.link?.label ?? ""}
              placeholder="표시할 이름 (선택)"
              className={fieldClass}
            />
          </div>
          <p className="mt-2 text-sm text-ink-400">
            입력하면 글 위에 바로가기 단추로 보입니다. 표시할 이름을 비우면 주소가 그대로 나옵니다.
          </p>
        </div>

        {hasEventFields && (
          <fieldset className="rounded-xl bg-surface px-6 py-6">
            <legend className="px-1 text-base font-bold text-navy-900">행사 정보</legend>
            <p className="mt-1 text-sm text-ink-400">
              비워 두어도 됩니다. 접수중·예정·종료 표시는 아래 날짜에서 자동으로 계산합니다.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="event-host" className="mb-2 block text-base font-bold text-navy-900">
                  주최
                </label>
                <input
                  id="event-host"
                  name="eventHost"
                  type="text"
                  defaultValue={post?.event?.host ?? ""}
                  placeholder="예: 정보통신산업진흥원"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="event-place" className="mb-2 block text-base font-bold text-navy-900">
                  장소
                </label>
                <input
                  id="event-place"
                  name="eventPlace"
                  type="text"
                  defaultValue={post?.event?.place ?? ""}
                  placeholder="예: 코엑스 3층"
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="event-starts"
                  className="mb-2 block text-base font-bold text-navy-900"
                >
                  행사 시작일
                </label>
                <input
                  id="event-starts"
                  name="eventStartsOn"
                  type="date"
                  defaultValue={post?.event?.startsOn ?? ""}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="event-ends" className="mb-2 block text-base font-bold text-navy-900">
                  행사 종료일
                </label>
                <input
                  id="event-ends"
                  name="eventEndsOn"
                  type="date"
                  defaultValue={post?.event?.endsOn ?? ""}
                  className={fieldClass}
                />
                <p className="mt-2 text-sm text-ink-400">여러 날 진행할 때만 채웁니다.</p>
              </div>

              <div>
                <label
                  htmlFor="event-apply"
                  className="mb-2 block text-base font-bold text-navy-900"
                >
                  신청 마감일
                </label>
                <input
                  id="event-apply"
                  name="eventApplyBy"
                  type="date"
                  defaultValue={post?.event?.applyBy ?? ""}
                  className={fieldClass}
                />
                <p className="mt-2 text-sm text-ink-400">
                  이 날짜까지는 목록에 접수중으로 표시됩니다.
                </p>
              </div>
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="post-files" className="mb-2 block text-base font-bold text-navy-900">
            첨부파일
          </label>

          {post && post.attachments.length > 0 && (
            <ul className="mb-3 space-y-2">
              {post.attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-base text-ink-600">
                  <input
                    type="checkbox"
                    id={`keep-${a.id}`}
                    name="keepAttachment"
                    value={a.id}
                    defaultChecked
                    className="size-4 rounded border-line accent-brand-600"
                  />
                  <label htmlFor={`keep-${a.id}`}>
                    {a.filename}
                    <span className="label-mono ml-2 text-ink-400">{formatBytes(a.byteSize)}</span>
                  </label>
                </li>
              ))}
              <li className="text-sm text-ink-400">
                체크를 해제한 파일은 저장할 때 삭제됩니다.
              </li>
            </ul>
          )}

          <input
            id="post-files"
            name="files"
            type="file"
            multiple
            className="w-full rounded-md border border-line px-4 py-3 text-base file:mr-4 file:rounded file:border-0 file:bg-surface file:px-4 file:py-2 file:text-base file:font-semibold file:text-navy-900"
          />
          <p className="mt-2 text-sm text-ink-400">한 개당 20MB까지 올릴 수 있습니다.</p>
        </div>

        <div className="flex flex-wrap gap-6 rounded-xl bg-surface px-6 py-5">
          <label className="flex items-center gap-2 text-base text-ink-700">
            <input
              type="checkbox"
              name="isPinned"
              defaultChecked={post?.isPinned}
              className="size-4 rounded border-line accent-brand-600"
            />
            상단 고정 (공지)
          </label>
          <label className="flex items-center gap-2 text-base text-ink-700">
            <input
              type="checkbox"
              name="isLocked"
              defaultChecked={post?.isLocked}
              className="size-4 rounded border-line accent-brand-600"
            />
            회원 전용
          </label>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700"
        >
          {state.error}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href={listPath}
          className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-full bg-navy-900 px-7 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : isEdit ? "수정" : "등록"}
        </button>
      </div>
    </form>
  );
}
