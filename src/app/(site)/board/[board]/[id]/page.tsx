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
  const board = getBoardAt(`/board/${slug}`);
  const post = board ? await getPostCached(board.slug, Number(id)) : null;
  /*
    없는 글.
    기다리는 뼈대(loading.tsx)가 화면 껍데기를 먼저 내보내므로 응답 코드는 200 으로 굳는다.
    대신 검색 엔진에 담지 말라고 표시해서 없는 글이 검색에 남지 않게 한다.
  */
  if (!board || !post) {
    return { title: "찾을 수 없는 글", robots: { index: false, follow: false } };
  }
  /*
    회원 전용 글은 본문을 설명으로 쓰지 않는다.

    화면에서는 '회원 전용 게시물입니다'로 막지만, 설명은 머리말(meta)로 나가므로
    막아 놓고도 검색 결과와 카톡·페이스북 링크 미리보기에 본문이 그대로 실렸다.
    제목은 목록에 이미 보이므로 그대로 두고 설명만 게시판 설명으로 바꾼다.
    그림만 있는 글(뉴스레터 등)도 본문 글자가 없으니 같은 자리로 온다.
  */
  const description = post.isLocked ? board.desc : htmlToText(post.body) || board.desc;
  return pageMeta(post.title, `${board.basePath}/${Number(id)}`, description);
}

export default async function Page({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: slug, id } = await params;
  const board = getBoardAt(`/board/${slug}`);
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
