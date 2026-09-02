import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BoardListView from "@/components/board/BoardListView";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { BOARDS, getBoardAt } from "@/lib/boards";

/* 정보서비스 메뉴 아래 게시판: 산업뉴스·기술동향·자료실·뉴스레터 */
export function generateStaticParams() {
  return BOARDS.filter((b) => b.basePath.startsWith("/info/")).map((b) => ({ board: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  return { title: getBoardAt(`/info/${board}`)?.name ?? "정보서비스" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { board: slug } = await params;
  const board = getBoardAt(`/info/${slug}`);
  if (!board) notFound();

  return (
    <BoardListView
      board={board}
      searchParams={searchParams}
      /* 뉴스레터는 지난 호 목록 위에 구독 신청을 함께 둔다 */
      intro={board.slug === "newsletter" ? <NewsletterSubscribe /> : null}
    />
  );
}
