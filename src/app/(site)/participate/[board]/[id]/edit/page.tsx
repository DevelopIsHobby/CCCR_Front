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
  return { title: `${getBoardAt(`/participate/${board}`)?.name ?? "참여하기"} 수정` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/participate/${slug}`);
  if (!board) notFound();

  return <PostEditView board={board} id={id} />;
}
