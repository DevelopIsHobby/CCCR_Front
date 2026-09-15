import Link from "next/link";
import { IconClip } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";
import { formatDate } from "@/lib/format";

/*
  뉴스레터.

  표지를 나란히 늘어놓고 고르게 한다. 한 호를 통째로 펼치면 세로로 길어져
  두세 호만 지나도 아래를 못 보고, 어떤 호가 있는지 한눈에 들어오지 않는다.
  표지는 그 호가 무엇인지 알려 주는 그림이므로, 위쪽만 보여도 고르는 데 모자라지
  않는다. 읽기는 자세히 보기에서 한다.

  표지 자리는 비율로 미리 잡아 둔다(세로로 긴 3:4). 그림마다 크기가 달라도
  칸이 흔들리지 않고, 그림이 늦게 떠도 아래 줄이 밀리지 않는다.
  그림이 없는 호(첨부만 있는 경우)는 같은 자리에 첨부 표시를 둔다.
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
    /* 한 줄에 3장이면 표지 한 장이 화면 절반을 차지해 너무 컸다. 책꽂이처럼 여러 장을 나란히 둔다 */
    <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
      {all.map(({ post, pinned: isPinnedRow }) => (
        <li key={`${isPinnedRow ? "pin" : "row"}-${post.id}`}>
          <Link
            href={`${base}/${post.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-surface">
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
                    /* 표지는 위에서부터 보여 준다. 제호와 제목이 머리에 있다 */
                    className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </>
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-400">
                  <IconClip className="size-5" />
                  <span className="text-sm">첨부파일로 제공</span>
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 border-t border-line px-3.5 py-3 sm:px-4">
              {isPinnedRow && (
                <p className="flex">
                  <PinnedBadge />
                </p>
              )}

              <p className="line-clamp-2 text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                {post.title}
              </p>

              <p className="label-mono mt-auto flex items-center gap-3 tabular-nums text-ink-400">
                {formatDate(post.createdAt)}
                {post.attachmentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <IconClip className="size-3.5" />
                    첨부 {post.attachmentCount}
                  </span>
                )}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
