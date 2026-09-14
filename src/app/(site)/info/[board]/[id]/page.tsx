import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailView from "@/components/board/PostDetailView";
import { getBoardAt } from "@/lib/boards";
import { getPost } from "@/lib/db/posts";
import { htmlToText } from "@/lib/html";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}): Promise<Metadata> {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/info/${slug}`);
  const post = board ? await getPost(board.slug, Number(id)) : null;
  if (!board || !post) return { title: board?.name ?? "정보서비스" };
  /* 그림만 있는 글(뉴스레터 등)은 본문 글자가 없으니 게시판 설명으로 대신한다 */
  return pageMeta(post.title, `${board.basePath}/${Number(id)}`, htmlToText(post.body) || board.desc);
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
