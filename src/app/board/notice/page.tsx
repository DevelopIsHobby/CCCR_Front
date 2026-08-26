import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { BoardSearch, Pagination } from "@/components/sub/Ui";
import { IconClip, IconLock } from "@/components/Icons";
import { listPosts, type PostRow } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "공지사항" };

const BOARD = "notice";
const BASE = "/board/notice";

/** 등록 7일 이내면 새 글로 표시한다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

const fmtDate = (iso: string) => iso.slice(0, 10).replace(/-/g, ".");

function TitleCell({ post }: { post: PostRow }) {
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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const { pinned, rows, total, page, totalPages } = await listPosts({
    board: BOARD,
    page: Number(sp.page) || 1,
    q,
  });
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const all = [...pinned, ...rows];

  return (
    <PageShell href="/board/notice" desc="조합 운영과 정부·유관기관 공고를 안내합니다.">
      <BoardSearch total={total} action={BASE} q={q} />

      {q && (
        <p className="mt-4 text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {total}건
        </p>
      )}

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
                  {q ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다."}
                </td>
              </tr>
            )}

            {all.map((p, i) => (
              <tr
                key={`${p.isPinned && i < pinned.length ? "pin" : "row"}-${p.id}`}
                className="group border-b border-line hover:bg-brand-50/60"
              >
                <td className="px-5 py-4 text-center">
                  {p.isPinned && i < pinned.length ? (
                    <span className="inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
                      공지
                    </span>
                  ) : (
                    <span className="label-mono tabular-nums text-ink-400">{p.seq}</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Link href={`${BASE}/${p.id}`} className="block">
                    <TitleCell post={p} />
                  </Link>
                </td>
                <td className="px-5 py-4 text-center text-base text-ink-400">{p.authorName}</td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {fmtDate(p.createdAt)}
                </td>
                <td className="label-mono px-5 py-4 text-center tabular-nums text-ink-400">
                  {p.views}
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
            {q ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다."}
          </li>
        )}

        {all.map((p, i) => (
          <li
            key={`${p.isPinned && i < pinned.length ? "pin" : "row"}-${p.id}`}
            className="group border-b border-line"
          >
            <Link href={`${BASE}/${p.id}`} className="block py-5">
              {p.isPinned && i < pinned.length && (
                <span className="mb-3 inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
                  공지
                </span>
              )}
              <p className="text-md font-medium leading-relaxed">
                <TitleCell post={p} />
              </p>
              <p className="label-mono mt-3 tabular-nums text-ink-400">
                {fmtDate(p.createdAt)} · 조회 {p.views}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="mt-8 flex justify-end">
          <Link
            href={`${BASE}/write`}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            글쓰기
          </Link>
        </div>
      )}

      <Pagination basePath={BASE} page={page} totalPages={totalPages} q={q} />
    </PageShell>
  );
}
