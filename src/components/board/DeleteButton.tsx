"use client";

import { deletePost } from "@/lib/db/post-actions";

export default function DeleteButton({ board, id }: { board: string; id: number }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!confirm("이 글을 삭제할까요? 첨부파일도 함께 삭제됩니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="board" value={board} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
      >
        삭제
      </button>
    </form>
  );
}
