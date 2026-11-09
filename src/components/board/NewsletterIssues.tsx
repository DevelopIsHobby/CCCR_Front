import Link from "next/link";
import { IconClip } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, withPinned } from "./BoardTable";

/*
  뉴스레터.

  뉴스레터 그림만 이어서 늘어놓는다(2026-11-09 사무국: "이미지로만 쭉"). 전에는 표지 위쪽을
  3:4 로 잘라 보이고 아래에 제목·날짜 칸을 두었는데, 그림이 잘리고 글자 칸이 그림 사이를 끊었다.
  이제 그림을 자르지 않고 원래 비율대로 세로 단에 차곡차곡 쌓는다(여러 단 신문처럼).
  제목은 그림 설명(alt)과 마우스를 올렸을 때 뜨는 글로 남긴다. 누르면 그 호를 연다.
  그림이 없는 호(첨부만 있는 경우)는 같은 자리에 제목과 첨부 표시를 둔다.
*/
export default function NewsletterIssues({
  base,
  pinned,
  rows,
  searching,
}: {
  base: string;
  pinned: PostRow[];
  rows: PostRow[];
  searching: boolean;
}) {
  const all = withPinned(pinned, rows);

  if (all.length === 0) {
    return (
      <p className="mt-6 border-y-2 border-navy-900 py-11 text-center text-md text-ink-400">
        {emptyMessage(searching)}
      </p>
    );
  }

  return (
    <ul className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 lg:gap-5">
      {all.map(({ post, pinned: isPinnedRow }) => (
        <li key={`${isPinnedRow ? "pin" : "row"}-${post.id}`} className="mb-4 break-inside-avoid lg:mb-5">
          <Link
            href={`${base}/${post.id}`}
            title={post.title}
            className="group block overflow-hidden rounded-lg ring-1 ring-line transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)] hover:ring-brand-500"
          >
            {post.thumbUrl ? (
              <>
                {/* 크기가 제각각인 그림이라 next/image 대신 img 를 쓴다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbUrl}
                  alt={post.title}
                  loading="lazy"
                  width={post.thumbWidth || undefined}
                  height={post.thumbHeight || undefined}
                  className="block h-auto w-full bg-surface"
                />
              </>
            ) : (
              <span className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-surface px-4 text-center text-ink-400">
                <span className="line-clamp-3 text-base font-bold text-navy-900">{post.title}</span>
                <span className="inline-flex items-center gap-1 text-sm">
                  <IconClip className="size-4" />
                  첨부파일로 제공
                </span>
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
