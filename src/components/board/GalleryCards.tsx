import Link from "next/link";
import { IconClip } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";
import { formatDate } from "@/lib/format";

/*
  뉴스레터 목록.
  뉴스레터는 그림 한 장이 곧 내용이라 제목만 늘어놓는 표로는 무엇이 실렸는지
  알 수 없다. 본문 맨 앞 그림을 표지로 삼아 카드로 늘어놓는다.
*/
export default function GalleryCards({
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
      <p className="mt-6 border-y-2 border-navy-900 py-20 text-center text-md text-ink-400">
        {emptyMessage(searching)}
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {all.map(({ post, pinned: isPinnedRow }) => (
        <li key={post.id}>
          <Link
            href={`${base}/${post.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_18px_34px_-20px_rgba(6,42,85,0.45)]"
          >
            {/* 표지 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              {post.thumbUrl ? (
                /* 크기를 미리 알 수 없는 그림이라 next/image 대신 img 를 쓴다 */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbUrl}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="grid size-full place-items-center">
                  <span className="label-mono text-ink-400">C3R 뉴스레터</span>
                </span>
              )}

              {isPinnedRow && (
                <span className="absolute left-3 top-3">
                  <PinnedBadge />
                </span>
              )}
            </div>

            {/* 제목과 날짜 */}
            <div className="flex flex-1 flex-col p-5">
              <p className="line-clamp-2 text-md font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                {post.title}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-4">
                <span className="label-mono tabular-nums text-ink-400">
                  {formatDate(post.createdAt)}
                </span>
                {post.attachmentCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-ink-400">
                    <IconClip className="size-3.5" />
                    {post.attachmentCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
