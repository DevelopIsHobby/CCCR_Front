import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import PostForm from "@/components/board/PostForm";
import { getSession } from "@/lib/auth/session";
import type { BoardConfig } from "@/lib/boards";

/** 글쓰기 화면. 관리자가 아니면 로그인으로 보낸다. */
export default async function PostWriteView({ board }: { board: BoardConfig }) {
  const base = board.basePath;
  const session = await getSession();
  if (session?.role !== "admin") redirect(`/login?next=${base}/write`);

  return (
    <PageShell href={base} desc={`새 ${board.name} 게시물을 등록합니다.`}>
      <PostForm board={board.slug} listPath={base} hasEventFields={board.hasEventFields} />
    </PageShell>
  );
}
