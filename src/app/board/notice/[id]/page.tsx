import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import ViewCounter from "./ViewCounter";
import DeleteButton from "@/components/board/DeleteButton";
import { IconChevron, IconClip, IconLock } from "@/components/Icons";
import { getNeighbors, getPost } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";
import { formatBytes, formatDate } from "@/lib/format";

const BASE = "/board/notice";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost("notice", Number(id));
  return { title: post ? post.title : "공지사항" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost("notice", Number(id));
  if (!post) notFound();

  const session = await getSession();
  const isAdmin = session?.role === "admin";
  /* 회원 전용 글은 로그인해야 본문과 첨부를 볼 수 있다. */
  const canRead = !post.isLocked || session !== null;
  const { prev, next } = await getNeighbors("notice", post.id);

  return (
    <PageShell href={BASE}>
      <ViewCounter postId={post.id} />

      <article>
        <header className="border-y-2 border-navy-900 py-7">
          <div className="flex flex-wrap items-center gap-2">
            {post.isPinned && (
              <span className="inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
                공지
              </span>
            )}
            {post.isLocked && (
              <span className="inline-flex items-center gap-1 rounded bg-surface px-2.5 py-1 text-2xs font-bold text-ink-600">
                <IconLock className="size-3" />
                회원 전용
              </span>
            )}
          </div>

          <h1 className="mt-4 text-xl font-bold leading-snug text-navy-900 lg:text-2xl">
            {post.title}
          </h1>

          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-base text-ink-400">
            <div className="flex gap-2">
              <dt>글쓴이</dt>
              <dd className="text-ink-600">{post.authorName}</dd>
            </div>
            <div className="flex gap-2">
              <dt>등록일</dt>
              <dd className="label-mono tabular-nums text-ink-600">
                {formatDate(post.createdAt)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>조회</dt>
              <dd className="label-mono tabular-nums text-ink-600">{post.views}</dd>
            </div>
          </dl>
        </header>

        {canRead ? (
          <>
            {post.attachments.length > 0 && (
              <ul className="border-b border-line py-5">
                {post.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`/api/attachments/${a.id}`}
                      className="group inline-flex items-center gap-2 py-1.5 text-base text-ink-600 hover:text-brand-600"
                    >
                      <IconClip className="size-4 shrink-0 text-ink-400 group-hover:text-brand-500" />
                      <span className="underline-offset-2 group-hover:underline">
                        {a.filename}
                      </span>
                      <span className="label-mono text-ink-400">{formatBytes(a.byteSize)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="whitespace-pre-wrap py-10 text-md leading-[1.9] text-ink-700">
              {post.body || "내용이 없습니다."}
            </div>
          </>
        ) : (
          <div className="my-10 rounded-xl bg-surface px-8 py-14 text-center">
            <IconLock className="mx-auto size-7 text-ink-400" />
            <p className="mt-4 text-md font-bold text-navy-900">회원 전용 게시물입니다.</p>
            <p className="mt-2 text-base text-ink-600">
              로그인 후 본문과 첨부파일을 확인하실 수 있습니다.
            </p>
            <Link
              href={`/login?next=${BASE}/${post.id}`}
              className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-navy-900"
            >
              로그인
            </Link>
          </div>
        )}
      </article>

      {/* 이전 글 · 다음 글 */}
      <nav className="border-t-2 border-navy-900" aria-label="이전 다음 글">
        {[
          { label: "이전 글", post: prev },
          { label: "다음 글", post: next },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-4 border-b border-line px-1 py-4"
          >
            <span className="flex w-24 shrink-0 items-center gap-1.5 text-base font-bold text-navy-900">
              <IconChevron
                className={`size-3.5 text-ink-400 ${
                  row.label === "이전 글" ? "-rotate-90" : "rotate-90"
                }`}
              />
              {row.label}
            </span>
            {row.post ? (
              <Link
                href={`${BASE}/${row.post.id}`}
                className="truncate text-md text-ink-600 hover:text-brand-600"
              >
                {row.post.title}
              </Link>
            ) : (
              <span className="text-md text-ink-400">없습니다.</span>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={BASE}
          className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          목록
        </Link>

        {isAdmin && (
          <div className="flex gap-3">
            <Link
              href={`${BASE}/${post.id}/edit`}
              className="inline-flex items-center rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              수정
            </Link>
            <DeleteButton board="notice" id={post.id} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
