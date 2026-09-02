import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostEditView from "@/components/board/PostEditView";
import { getBoardAt } from "@/lib/boards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  return { title: `${getBoardAt(`/board/${board}`)?.name ?? "게시판"} 수정` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/board/${slug}`);
  if (!board) notFound();

  return <PostEditView board={board} id={id} />;
}
