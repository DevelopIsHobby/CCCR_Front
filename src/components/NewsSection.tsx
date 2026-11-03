import Link from "next/link";
import SmartLink from "./SmartLink";
import { IconPlus } from "./Icons";
import { getBoard, postHref, type BoardConfig } from "@/lib/boards";
import { listRecentByBoard, type PostRow } from "@/lib/db/posts";
import { formatDate, noticeStatus, type NoticeStatus } from "@/lib/format";

/** 등록 7일 이내면 새 글로 표시한다. 게시판 목록과 같은 기준이다. */
const isNew = (iso: string) =>
  Date.now() - new Date(`${iso.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;

/* 게시판마다 보여 줄 글 수 */
const PER_BOARD = 5;

/*
  메인에 나란히 두는 게시판. 왼쪽 공지사항, 오른쪽 사업공고.

  전에는 왼쪽에 게시판 탭 목록, 오른쪽에 '지금 모집 중' 알림판을 두었다. 위의 슬라이드·
  바로가기, 아래 아카데미까지 홍보 칸이 이어져 홍보가 너무 많았다(2026-11-03 사무국).
  알림판을 빼고 사람들이 가장 많이 찾는 두 게시판을 같은 무게로 나란히 둔다.
*/
const COLUMNS = ["notice", "announce"] as const;

const STATUS_TONE: Record<NoticeStatus, string> = {
  접수예정: "bg-white text-navy-900 ring-1 ring-line",
  접수중: "bg-brand-50 text-brand-700",
  마감: "bg-surface text-ink-400",
};

export default async function NewsSection() {
  const boards = COLUMNS.map((slug) => getBoard(slug)).filter((b): b is BoardConfig => Boolean(b));
  const posts = await listRecentByBoard(
    boards.map((b) => b.slug),
    PER_BOARD,
  );

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-10 lg:py-12">
      {/*
        격자 칸은 기본이 min-width:auto 라 속 내용보다 좁아지기를 거부한다.
        제목이 길면 칸이 밀려 화면이 가로로 흔들리므로 min-w-0 을 준다.
      */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
        {boards.map((board) => (
          <BoardColumn
            key={board.slug}
            board={board}
            posts={posts.filter((p) => p.board === board.slug).slice(0, PER_BOARD)}
          />
        ))}
      </div>
    </section>
  );
}

function BoardColumn({ board, posts }: { board: BoardConfig; posts: PostRow[] }) {
  const headingId = `home-${board.slug}`;
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-2xl font-bold text-navy-900 lg:text-3xl">
          {board.name}
        </h2>
        <Link
          href={board.basePath}
          aria-label={`${board.name} 전체 보기`}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 ring-1 ring-line transition-colors hover:bg-flame-500 hover:text-white hover:ring-flame-500"
        >
          <IconPlus className="size-4" />
        </Link>
      </div>

      <ul className="mt-6 border-t-2 border-navy-900" aria-labelledby={headingId}>
        {posts.length === 0 && (
          <li className="border-b border-line py-11 text-center text-md text-ink-400">
            등록된 글이 없습니다.
          </li>
        )}

        {posts.map((post) => {
          /* 사업공고는 원문 공고로 바로 보내고(새 창), 접수 상태를 앞에 붙인다 */
          const status = board.hasDeadlineFields ? noticeStatus(post.event) : null;
          return (
            <li key={post.id} className="border-b border-line">
              {/* 휴대폰에서는 날짜를 제목 아래 줄로 내려 제목이 좁아지지 않게 한다 */}
              <SmartLink
                href={postHref(board, post.id, post.link?.url)}
                className="group flex flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
                  {status && (
                    <span
                      className={`mt-0.5 inline-flex shrink-0 rounded px-2 py-0.5 text-2xs font-bold sm:mt-0 ${STATUS_TONE[status]}`}
                    >
                      {status}
                    </span>
                  )}
                  <span className="line-clamp-2 min-w-0 flex-1 text-md font-medium text-ink-900 transition-colors group-hover:text-brand-600 sm:line-clamp-none sm:truncate">
                    {post.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {isNew(post.createdAt) && <span className="label-mono text-flame-500">new</span>}
                  <span className="label-mono tabular-nums text-ink-400">
                    {formatDate(post.createdAt)}
                  </span>
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
