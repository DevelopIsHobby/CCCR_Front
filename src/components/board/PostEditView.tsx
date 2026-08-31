import { notFound, redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import PostForm from "@/components/board/PostForm";
import { getPost } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";
import type { BoardConfig } from "@/lib/boards";

/** 수정 화면. 관리자가 아니면 로그인으로 보낸다. */
export default async function PostEditView({
  board,
  id,
}: {
  board: BoardConfig;
  id: string;
}) {
  const base = board.basePath;
  const session = await getSession();
  if (session?.role !== "admin") redirect(`/login?next=${base}/${id}/edit`);

  const post = await getPost(board.slug, Number(id));
  if (!post) notFound();

  return (
    <PageShell href={base} desc={`등록된 ${board.name} 게시물을 수정합니다.`}>
      <PostForm
        board={board.slug}
        listPath={base}
        hasEventFields={board.hasEventFields}
        post={{
          id: post.id,
          title: post.title,
          body: post.body,
          isPinned: post.isPinned,
          isLocked: post.isLocked,
          attachments: post.attachments,
          event: post.event,
          link: post.link,
        }}
      />
    </PageShell>
  );
}
