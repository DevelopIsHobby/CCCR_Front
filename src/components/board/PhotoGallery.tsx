import Link from "next/link";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";
import { formatDate } from "@/lib/format";

/*
  포토갤러리 목록.

  글 하나가 행사 하나다. 첫 사진을 가로 4:3 카드로 늘어놓고 제목·날짜를 아래에 둔다.
  행사 사진은 가로로 찍는 일이 많아 뉴스레터 표지(세로 3:4)와 달리 가로로 잡고,
  가운데를 보여 준다(object-cover). 칸 비율을 미리 잡아 두어 사진이 늦게 떠도 줄이 밀리지 않는다.
  사진이 없는 글은 같은 자리에 '사진 없음'을 둔다.
*/
export default function PhotoGallery({
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
      <p className="mt-6 rounded-xl border border-dashed border-line bg-white py-16 text-center text-md text-ink-400">
        {emptyMessage(searching)}
      </p>
    );
  }

  return (
    <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {all.map(({ post, pinned: isPinnedRow }) => (
        <li key={`${isPinnedRow ? "pin" : "row"}-${post.id}`}>
          <Link
            href={`${base}/${post.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-surface">
              {post.thumbUrl ? (
                <>
                  {/* 크기가 제각각인 사진이라 next/image 대신 img 를 쓴다 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbUrl}
                    alt=""
                    loading="lazy"
                    width={post.thumbWidth || undefined}
                    height={post.thumbHeight || undefined}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </>
              ) : (
                <span className="flex size-full items-center justify-center text-sm text-ink-400">
                  사진 없음
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
              {isPinnedRow && (
                <p className="flex">
                  <PinnedBadge />
                </p>
              )}
              <p className="line-clamp-2 text-md font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                {post.title}
              </p>
              <p className="label-mono mt-auto tabular-nums text-ink-400">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
