import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoardListView from "@/components/board/BoardListView";
import { BOARDS, getBoardAt } from "@/lib/boards";
import { pageMeta } from "@/lib/page-meta";

/* 참여하기 메뉴 아래 게시판: 강사 모집. 참여 안내·교육사업 제안·신청 현황 조회는 따로 둔 화면이다 */
export function generateStaticParams() {
  return BOARDS.filter((b) => b.basePath.startsWith("/participate/")).map((b) => ({ board: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  const b = getBoardAt(`/participate/${board}`);
  return b ? pageMeta(b.name, b.basePath, b.desc) : { title: "참여하기" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string; q?: string; cat?: string; status?: string }>;
}) {
  const { board: slug } = await params;
  const board = getBoardAt(`/participate/${slug}`);
  if (!board) notFound();

  return <BoardListView board={board} searchParams={searchParams} />;
}
