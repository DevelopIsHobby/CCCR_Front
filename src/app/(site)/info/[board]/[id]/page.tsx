import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailView from "@/components/board/PostDetailView";
import { getBoardAt } from "@/lib/boards";
import { getPostCached } from "@/lib/db/posts";
import { htmlToText } from "@/lib/html";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}): Promise<Metadata> {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/info/${slug}`);
  const post = board ? await getPostCached(board.slug, Number(id)) : null;
  /*
    없는 글.
    기다리는 뼈대(loading.tsx)가 화면 껍데기를 먼저 내보내므로 응답 코드는 200 으로 굳는다.
    대신 검색 엔진에 담지 말라고 표시해서 없는 글이 검색에 남지 않게 한다.
  */
  if (!board || !post) {
    return { title: "찾을 수 없는 글", robots: { index: false, follow: false } };
  }
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

  /*
    없는 글은 화면을 그리기 전에 여기서 끝낸다.
    PostDetailView 안에서 notFound() 를 부르면 머리말이 이미 나간 뒤라
    응답 코드가 200 으로 남는다(검색 엔진이 없는 글을 계속 붙잡는다).
  */
  const post = await getPostCached(board.slug, Number(id));
  if (!post) notFound();

  return <PostDetailView board={board} id={id} />;
}
