import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailView from "@/components/board/PostDetailView";
import { getBoardAt } from "@/lib/boards";
import { getPost } from "@/lib/db/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}): Promise<Metadata> {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/info/${slug}`);
  const post = board ? await getPost(board.slug, Number(id)) : null;
  return { title: post ? post.title : (board?.name ?? "정보서비스") };
}

export default async function Page({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/info/${slug}`);
  if (!board) notFound();

  return <PostDetailView board={board} id={id} />;
}
