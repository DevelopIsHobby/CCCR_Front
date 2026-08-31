import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoardListView from "@/components/board/BoardListView";
import { BOARDS, getBoardAt } from "@/lib/boards";

/*
  게시판 메뉴 아래에 있는 게시판만 이 경로가 받는다.
  산업뉴스처럼 다른 메뉴에 사는 게시판은 basePath 가 달라 여기서 404 로 막는다.
  (같은 글이 두 주소에서 열리면 안 된다.)
*/
export function generateStaticParams() {
  return BOARDS.filter((b) => b.basePath === `/board/${b.slug}`).map((b) => ({ board: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  return { title: getBoardAt(`/board/${board}`)?.name ?? "게시판" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { board: slug } = await params;
  const board = getBoardAt(`/board/${slug}`);
  if (!board) notFound();

  return <BoardListView board={board} searchParams={searchParams} />;
}
