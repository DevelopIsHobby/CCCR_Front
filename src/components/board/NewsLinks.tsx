import Link from "next/link";
import type { PostRow } from "@/lib/db/posts";
import { postHref, type BoardConfig } from "@/lib/boards";
import { formatDate } from "@/lib/format";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";

/*
  산업뉴스 — 바깥 기사로 보내는 목록.

  사무국이 기사 전문을 옮겨 쓰지 않고 원문 기사 주소만 모으므로, 번호·글쓴이·조회수가 있는
  게시판 표는 맞지 않았다. 한 줄에 제목·출처·날짜만 두고, 제목을 누르면 원문 기사가 새 창으로 열린다.
  출처는 글쓰기의 링크 '표시할 이름'(언론사 이름)이고, 비어 있으면 기사 주소의 도메인을 보여 준다.
  링크가 없는 옛 글은 사이트 안 글 화면으로 보낸다.
*/

function sourceOf(url: string, label: string | null): string {
  if (label) return label;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export default function NewsLinks({
  board,
  pinned,
  rows,
  searching,
  isAdmin,
}: {
  board: BoardConfig;
  pinned: PostRow[];
  rows: PostRow[];
  searching: boolean;
  /** 관리자에게는 줄 끝에 수정 링크를 둔다. 제목이 바깥으로 나가므로 글 화면을 거치지 않는다 */
  isAdmin: boolean;
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
    <ul className="mt-6 border-t-2 border-navy-900">
      {all.map(({ post, pinned: isPinnedRow }) => {
        const href = postHref(board, post.id, post.link?.url);
        const external = Boolean(post.link?.url);
        const source = post.link ? sourceOf(post.link.url, post.link.label) : "";

        const title = (
          <>
            <span className="text-md font-semibold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
              {post.title}
            </span>
            {external && (
              <IconExternal className="ml-1.5 inline size-3.5 align-[-1px] text-ink-400 transition-colors group-hover:text-brand-600" />
            )}
          </>
        );

        return (
          <li
            key={`${isPinnedRow ? "pin" : "row"}-${post.id}`}
            className="flex flex-col gap-1.5 border-b border-line py-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex min-w-0 flex-1 items-start gap-2">
              {isPinnedRow && (
                <span className="mt-0.5 shrink-0">
                  <PinnedBadge />
                </span>
              )}
              {external ? (
                <a href={href} target="_blank" rel="noreferrer noopener" className="group min-w-0">
                  {title}
                  <span className="sr-only"> (원문 기사, 새 창)</span>
                </a>
              ) : (
                <Link href={href} className="group min-w-0">
                  {title}
                </Link>
              )}
            </div>

            <p className="flex shrink-0 items-center gap-3 text-sm text-ink-400 sm:justify-end">
              {source && <span className="max-w-[12rem] truncate">{source}</span>}
              <span className="label-mono tabular-nums">{formatDate(post.createdAt)}</span>
              {isAdmin && (
                <Link
                  href={`${board.basePath}/${post.id}/edit`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  수정
                </Link>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
