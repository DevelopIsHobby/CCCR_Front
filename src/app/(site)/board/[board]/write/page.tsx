import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostWriteView from "@/components/board/PostWriteView";
import { getBoardAt } from "@/lib/boards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  return { title: `${getBoardAt(`/board/${board}`)?.name ?? "게시판"} 글쓰기` };
}

export default async function Page({ params }: { params: Promise<{ board: string }> }) {
  const { board: slug } = await params;
  const board = getBoardAt(`/board/${slug}`);
  if (!board) notFound();

  return <PostWriteView board={board} />;
}
