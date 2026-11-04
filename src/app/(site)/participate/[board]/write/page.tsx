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
  return { title: `${getBoardAt(`/participate/${board}`)?.name ?? "참여하기"} 글쓰기` };
}

export default async function Page({ params }: { params: Promise<{ board: string }> }) {
  const { board: slug } = await params;
  const board = getBoardAt(`/participate/${slug}`);
  if (!board) notFound();

  return <PostWriteView board={board} />;
}
