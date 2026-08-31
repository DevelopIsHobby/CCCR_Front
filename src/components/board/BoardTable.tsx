import Link from "next/link";
import { IconClip, IconLock } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

/** 등록 7일 이내면 새 글로 표시한다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

export function TitleCell({ post }: { post: PostRow }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-md text-ink-900 transition-colors group-hover:text-brand-600">
        {post.title}
      </span>
      {post.attachmentCount > 0 && (
        <IconClip className="size-3.5 shrink-0 text-ink-400" aria-label="첨부파일 있음" />
      )}
      {post.isLocked && (
        <IconLock className="size-3.5 shrink-0 text-ink-400" aria-label="회원 전용" />
      )}
      {isNew(post.createdAt) && <span className="label-mono shrink-0 text-flame-500">new</span>}
    </span>
  );
}

export function PinnedBadge() {
  return (
    <span className="inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
      공지
    </span>
  );
}

export function emptyMessage(searching: boolean) {
  return searching ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다.";
}

/** 목록에 고정 공지를 먼저 붙인다. 검색 중에는 pinned 가 비어 있다. */
export function withPinned(pinned: PostRow[], rows: PostRow[]) {
  return [
    ...pinned.map((p) => ({ post: p, pinned: true })),
    ...rows.map((p) => ({ post: p, pinned: false })),
  ];
}

export default function BoardTable({
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

  return (
    <>
      {/* 데스크톱: 표 */}
      <div className="mt-6 hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y-2 border-navy-900 bg-surface">
              <th className="w-24 px-5 py-4 text-center text-base font-bold text-navy-900">번호</th>
              <th className="px-5 py-4 text-base font-bold text-navy-900">제목</th>
              <th className="w-32 px-5 py-4 text-center text-base font-bold text-navy-900">
                글쓴이
              </th>
              <th className="w-32 px-5 py-4 text-center text-base font-bold text-navy-900">
                등록일
              </th>
              <th className="w-24 px-5 py-4 text-center text-base font-bold text-navy-900">조회</th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 && (
              <tr className="border-b border-line">
                <td colSpan={5} className="px-5 py-16 text-center text-md text-ink-400">
                  {emptyMessage(searching)}
                </td>
              </tr>
            )}

            {all.map(({ post, pinned: isPinnedRow }) => (
              <tr
                key={`${isPinnedRow ? "pin" : "row"}-${post.id}`}
                className="group border-b border-line hover:bg-brand-50/60"
              >
                <td className="px-5 py-4 text-center">
                  {isPinnedRow ? (
                    <PinnedBadge />
                  ) : (
                    <span className="label-mono tabular-nums text-ink-400">{post.seq}</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Link href={`${base}/${post.id}`} className="block">
                    <TitleCell post={post} />
                  </Link>
                </td>
                <td className="px-5 py-4 text-center text-base text-ink-400">{post.authorName}</td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {formatDate(post.createdAt)}
                </td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {post.views}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <ul className="mt-6 border-t-2 border-navy-900 lg:hidden">
        {all.length === 0 && (
          <li className="border-b border-line py-16 text-center text-md text-ink-400">
            {emptyMessage(searching)}
          </li>
        )}

        {all.map(({ post, pinned: isPinnedRow }) => (
          <li key={`${isPinnedRow ? "pin" : "row"}-${post.id}`} className="group border-b border-line">
            <Link href={`${base}/${post.id}`} className="block py-5">
              {isPinnedRow && <span className="mb-3 block w-fit"><PinnedBadge /></span>}
              <p className="text-md font-medium leading-relaxed">
                <TitleCell post={post} />
              </p>
              <p className="label-mono mt-3 tabular-nums text-ink-400">
                {formatDate(post.createdAt)} · 조회 {post.views}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
