import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import ViewCounter from "./ViewCounter";
import DeleteButton from "@/components/board/DeleteButton";
import { IconArrow, IconChevron, IconClip, IconLock } from "@/components/Icons";
import { getNeighbors, getPost } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";
import type { BoardConfig } from "@/lib/boards";
import {
  eventStatus,
  formatBytes,
  formatDate,
  formatEventPeriod,
  type EventStatus,
} from "@/lib/format";

/** 편집기 도입 전 글은 순수 텍스트다. */
const isHtml = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);

const STATUS_TONE: Record<EventStatus, string> = {
  접수중: "bg-flame-500 text-white",
  예정: "bg-brand-600 text-white",
  종료: "bg-surface text-ink-400",
};

/** 글 상세 화면. 게시판 종류와 무관하게 같은 구성을 쓴다. */
export default async function PostDetailView({
  board,
  id,
}: {
  board: BoardConfig;
  id: string;
}) {
  const post = await getPost(board.slug, Number(id));
  if (!post) notFound();

  const session = await getSession();
  const isAdmin = session?.role === "admin";
  /* 회원 전용 글은 로그인해야 본문과 첨부를 볼 수 있다. */
  const canRead = !post.isLocked || session !== null;
  const { prev, next } = await getNeighbors(board.slug, post.id);

  const base = board.basePath;
  const status = board.hasEventFields ? eventStatus(post.event) : null;
  const period = formatEventPeriod(post.event.startsOn, post.event.endsOn);

  /* 행사 정보는 값이 있는 항목만 줄로 만든다. */
  const eventRows = board.hasEventFields
    ? [
        { label: "일시", value: period },
        { label: "장소", value: post.event.place ?? "" },
        { label: "주최", value: post.event.host ?? "" },
        {
          label: "신청 마감",
          value: post.event.applyBy ? formatDate(post.event.applyBy) : "",
        },
      ].filter((row) => row.value)
    : [];

  return (
    <PageShell href={base}>
      <ViewCounter postId={post.id} />

      <article>
        <header className="border-y-2 border-navy-900 py-7">
          <div className="flex flex-wrap items-center gap-2">
            {post.isPinned && (
              <span className="inline-flex rounded bg-flame-100 px-2.5 py-1 text-2xs font-bold text-flame-700">
                공지
              </span>
            )}
            {status && (
              <span
                className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[status]}`}
              >
                {status}
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

          {/* 한글 라벨과 숫자(mono)의 글자 크기가 달라 밑선을 맞춰 준다 */}
          <dl className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-base text-ink-400">
            <div className="flex items-baseline gap-2">
              <dt>글쓴이</dt>
              <dd className="text-ink-600">{post.authorName}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt>등록일</dt>
              <dd className="label-mono text-sm tabular-nums text-ink-600">
                {formatDate(post.createdAt)}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt>조회</dt>
              <dd className="label-mono text-sm tabular-nums text-ink-600">{post.views}</dd>
            </div>
          </dl>
        </header>

        {eventRows.length > 0 && (
          <dl className="mt-8 grid gap-x-10 gap-y-4 rounded-xl bg-surface px-7 py-6 sm:grid-cols-2">
            {eventRows.map((row) => (
              <div key={row.label} className="flex gap-4">
                <dt className="w-20 shrink-0 text-base font-bold text-navy-900">{row.label}</dt>
                <dd className="text-md leading-relaxed text-ink-700">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {post.link && (
          <a
            href={post.link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-6 flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-brand-500 hover:bg-brand-50/50"
          >
            <span className="shrink-0 rounded bg-white px-2 py-1 text-2xs font-bold text-flame-600 ring-1 ring-line">
              링크
            </span>
            <span className="min-w-0 flex-1 truncate text-base text-navy-900 transition-colors group-hover:text-brand-600">
              {post.link.label ?? post.link.url}
              {post.link.label && (
                <span className="label-mono ml-2 text-ink-400">{post.link.url}</span>
              )}
            </span>
            <IconArrow className="size-4 shrink-0 text-ink-400 transition-colors group-hover:text-brand-500" />
          </a>
        )}

        {canRead ? (
          <>
            {post.attachments.length > 0 && (
              <ul className="mt-8 border-b border-line pb-5">
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

            {post.body ? (
              /*
                본문은 저장할 때 허용 태그만 남기고 걸러 둔다(sanitizePostBody).
                편집기가 생기기 전에 쓴 글은 태그가 없으므로 줄바꿈만 살려 보여준다.
              */
              isHtml(post.body) ? (
                <div
                  className="rich-text py-10"
                  dangerouslySetInnerHTML={{ __html: post.body }}
                />
              ) : (
                <div className="whitespace-pre-wrap py-10 text-md leading-[1.9] text-ink-700">
                  {post.body}
                </div>
              )
            ) : (
              <div className="py-10 text-md text-ink-400">내용이 없습니다.</div>
            )}
          </>
        ) : (
          <div className="my-10 rounded-xl bg-surface px-8 py-11 text-center">
            <IconLock className="mx-auto size-7 text-ink-400" />
            <p className="mt-4 text-md font-bold text-navy-900">회원 전용 게시물입니다.</p>
            <p className="mt-2 text-base text-ink-600">
              로그인 후 본문과 첨부파일을 확인하실 수 있습니다.
            </p>
            <Link
              href={`/login?next=${base}/${post.id}`}
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
          <div key={row.label} className="flex items-center gap-4 border-b border-line px-1 py-4">
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
                href={`${base}/${row.post.id}`}
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
          href={base}
          className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          목록
        </Link>

        {isAdmin && (
          <div className="flex gap-3">
            <Link
              href={`${base}/${post.id}/edit`}
              className="inline-flex items-center rounded-full bg-navy-900 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              수정
            </Link>
            <DeleteButton board={board.slug} id={post.id} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
