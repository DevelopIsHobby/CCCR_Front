"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  bulkDeletePosts,
  togglePostFlag,
  type BulkState,
} from "@/lib/db/admin-post-actions";
import type { AdminPostRow } from "@/lib/db/admin-posts";
import { formatDate } from "@/lib/format";

const btn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

export default function AdminPostTable({
  posts,
  boardName,
  boardPath,
}: {
  posts: AdminPostRow[];
  /** slug → 게시판 이름 */
  boardName: Record<string, string>;
  /** slug → 게시판 주소 */
  boardPath: Record<string, string>;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [state, action, pending] = useActionState<BulkState, FormData>(
    async (prev, formData) => {
      const result = await bulkDeletePosts(prev, formData);
      if (result.ok) setSelected([]);
      return result;
    },
    {},
  );

  const allChecked = posts.length > 0 && selected.length === posts.length;

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white py-16 text-center text-md text-ink-400">
        해당하는 글이 없습니다.
      </p>
    );
  }

  return (
    <form action={action}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <p className="text-base text-ink-600">
          {selected.length > 0 ? (
            <>
              <b className="font-bold text-navy-900">{selected.length}건</b> 선택됨
            </>
          ) : (
            "지울 글을 선택하세요."
          )}
        </p>

        <button
          type="submit"
          disabled={pending || selected.length === 0}
          onClick={(e) => {
            if (!confirm(`선택한 ${selected.length}건을 삭제할까요? 되돌릴 수 없습니다.`)) {
              e.preventDefault();
            }
          }}
          className="rounded-full px-5 py-2.5 text-base font-bold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {pending ? "삭제 중…" : "선택 삭제"}
        </button>
      </div>

      {state.error && (
        <p role="alert" className="mb-3 rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mb-3 rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
          {state.ok}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,42,85,0.04)]">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="w-12 px-3 py-4 text-center">
                <input
                  type="checkbox"
                  aria-label="전체 선택"
                  checked={allChecked}
                  onChange={() => setSelected(allChecked ? [] : posts.map((p) => p.id))}
                  className="size-4 rounded border-line accent-brand-600"
                />
              </th>
              <th className="w-28 px-3 py-4 text-base font-bold text-navy-900">게시판</th>
              <th className="px-3 py-4 text-base font-bold text-navy-900">제목</th>
              <th className="w-28 px-3 py-4 text-center text-base font-bold text-navy-900">글쓴이</th>
              <th className="w-28 px-3 py-4 text-center text-base font-bold text-navy-900">등록일</th>
              <th className="w-20 px-3 py-4 text-center text-base font-bold text-navy-900">조회</th>
              <th className="w-64 px-3 py-4 text-base font-bold text-navy-900">처리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-line">
                <td className="px-3 py-4 text-center">
                  <input
                    type="checkbox"
                    name="ids"
                    value={post.id}
                    checked={selected.includes(post.id)}
                    onChange={() => toggle(post.id)}
                    aria-label={`${post.title} 선택`}
                    className="size-4 rounded border-line accent-brand-600"
                  />
                </td>

                <td className="px-3 py-4">
                  <span className="inline-flex rounded bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
                    {boardName[post.board] ?? post.board}
                  </span>
                </td>

                <td className="px-3 py-4">
                  <Link
                    href={`${boardPath[post.board]}/${post.id}`}
                    className="flex flex-wrap items-center gap-2 text-md text-ink-900 hover:text-brand-600"
                  >
                    {post.isPinned && (
                      <span className="inline-flex rounded bg-flame-100 px-2 py-0.5 text-2xs font-bold text-flame-700">
                        공지
                      </span>
                    )}
                    {post.isLocked && (
                      <span className="inline-flex rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-500">
                        회원 전용
                      </span>
                    )}
                    {post.title}
                    {post.attachmentCount > 0 && (
                      <span className="label-mono text-ink-400">첨부 {post.attachmentCount}</span>
                    )}
                  </Link>
                </td>

                <td className="px-3 py-4 text-center text-base text-ink-400">{post.authorName}</td>
                <td className="label-mono px-3 py-4 text-center tabular-nums text-ink-400">
                  {formatDate(post.createdAt)}
                </td>
                <td className="label-mono px-3 py-4 text-center tabular-nums text-ink-400">
                  {post.views}
                </td>

                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="submit"
                      formAction={togglePostFlag.bind(null, post.id, "pinned")}
                      className={btn}
                    >
                      {post.isPinned ? "고정 해제" : "상단 고정"}
                    </button>
                    <button
                      type="submit"
                      formAction={togglePostFlag.bind(null, post.id, "locked")}
                      className={btn}
                    >
                      {post.isLocked ? "공개 전환" : "회원 전용"}
                    </button>

                    <Link href={`${boardPath[post.board]}/${post.id}/edit`} className={btn}>
                      수정
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
