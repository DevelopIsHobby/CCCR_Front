"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPost, updatePost, type PostFormState } from "@/lib/db/post-actions";
import { formatBytes } from "@/lib/format";
import type { Attachment } from "@/lib/db/posts";

type Props = {
  board: string;
  listPath: string;
  post?: {
    id: number;
    title: string;
    body: string;
    isPinned: boolean;
    isLocked: boolean;
    attachments: Attachment[];
  };
};

const fieldClass =
  "w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

export default function PostForm({ board, listPath, post }: Props) {
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
          <label htmlFor="post-body" className="mb-2 block text-base font-bold text-navy-900">
            내용
          </label>
          <textarea
            id="post-body"
            name="body"
            rows={16}
            defaultValue={post?.body}
            placeholder="내용을 입력하세요"
            className={`${fieldClass} resize-y leading-[1.85]`}
          />
        </div>

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
