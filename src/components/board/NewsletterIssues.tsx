import Link from "next/link";
import { IconClip } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";
import { formatDate } from "@/lib/format";

/*
  뉴스레터.

  뉴스레터는 그림 한 장이 곧 내용이다. 표지만 잘라 늘어놓고 눌러 들어가게 하면
  읽기까지 한 번을 더 거치게 된다. 그림을 자르지 않고 그대로 펼쳐 이 화면에서
  바로 읽게 한다.

  그림이 없는 호(첨부만 있는 경우)는 펼칠 것이 없으므로 제목 줄로만 둔다.
  아래로 길어지므로 화면에 들어올 때 받도록(lazy) 두었다.
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
    <ul className="mt-8 space-y-10">
      {all.map(({ post, pinned: isPinnedRow }) => (
        <li key={post.id} className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 lg:px-6">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                {isPinnedRow && <PinnedBadge />}
                <Link
                  href={`${base}/${post.id}`}
                  className="text-lg font-bold text-navy-900 transition-colors hover:text-brand-600"
                >
                  {post.title}
                </Link>
              </p>
              <p className="label-mono mt-1 flex items-center gap-3 tabular-nums text-ink-400">
                {formatDate(post.createdAt)}
                {post.attachmentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <IconClip className="size-3.5" />
                    첨부 {post.attachmentCount}
                  </span>
                )}
              </p>
            </div>

            <Link
              href={`${base}/${post.id}`}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-base font-bold text-navy-900 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              자세히 보기
            </Link>
          </div>

          {post.thumbUrl ? (
            <Link href={`${base}/${post.id}`} className="block bg-surface">
              {/* 크기를 미리 알 수 없는 그림이라 next/image 대신 img 를 쓴다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.thumbUrl}
                alt={post.title}
                loading="lazy"
                className="mx-auto block h-auto w-full max-w-[720px]"
              />
            </Link>
          ) : (
            <p className="px-5 py-8 text-center text-md text-ink-400 lg:px-6">
              이 호는 그림 대신 첨부파일로 되어 있습니다. 자세히 보기에서 내려받으세요.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
