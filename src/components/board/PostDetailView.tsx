import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import ViewCounter from "./ViewCounter";
import DeleteButton from "@/components/board/DeleteButton";
import { IconArrow, IconChevron, IconClip, IconLock } from "@/components/Icons";
import { getNeighbors, getPostCached } from "@/lib/db/posts";
import { getSession } from "@/lib/auth/session";
import { deadlineWords, type BoardConfig } from "@/lib/boards";
import GalleryBody from "./GalleryBody";
import {
  eventStatus,
  noticeStatus,
  formatApplyPeriod,
  agencyName,
  formatBytes,
  formatDate,
  formatEventPeriod,
  type EventStatus,
  type NoticeStatus,
} from "@/lib/format";
import { shortUrl } from "@/lib/url-display";

/** 편집기 도입 전 글은 순수 텍스트다. */
const isHtml = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);

/* 행사(접수중·예정·종료)와 사업공고(접수중·마감)가 같은 딱지를 쓴다 */
const STATUS_TONE: Record<EventStatus | NoticeStatus, string> = {
  접수예정: "bg-brand-600 text-white",
  접수중: "bg-flame-500 text-white",
  예정: "bg-brand-600 text-white",
  종료: "bg-surface text-ink-400",
  마감: "bg-surface text-ink-400",
};

/*
  첨부파일 종류 딱지. 이름 끝까지 읽지 않아도 무슨 파일인지 보이게 한다.
  긴 파일 이름은 두 줄에서 잘려 확장자가 가려질 수 있는데, 딱지가 그것을 대신한다.
*/
function fileKind(filename: string): { label: string; tone: string } {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { label: "PDF", tone: "bg-flame-100 text-flame-700" };
  if (ext === "hwp" || ext === "hwpx") return { label: "HWP", tone: "bg-brand-100 text-brand-700" };
  if (ext === "doc" || ext === "docx") return { label: "DOC", tone: "bg-brand-100 text-brand-700" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { label: "XLS", tone: "bg-emerald-50 text-emerald-700" };
  if (ext === "ppt" || ext === "pptx") return { label: "PPT", tone: "bg-amber-50 text-amber-700" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return { label: "IMG", tone: "bg-brand-50 text-brand-600" };
  }
  if (["zip", "7z", "alz", "egg"].includes(ext)) return { label: "ZIP", tone: "bg-surface text-ink-600" };
  return { label: ext ? ext.slice(0, 4).toUpperCase() : "파일", tone: "bg-surface text-ink-600" };
}

/*
  링크 글자. 이름(label)이 있으면 이름과 사이트 이름을, 없으면 사이트 이름과 줄인 주소를 보여 준다.
  넓은 화면에서도 '…' 가 일찍 나오도록 글자 수로 자른다(url-display.ts).
*/
function LinkText({ url, label }: { url: string; label: string | null }) {
  const short = shortUrl(url);
  return (
    <span className="min-w-0 flex-1 truncate text-base">
      <span className="font-semibold text-navy-900 transition-colors group-hover:text-brand-600">
        {label ?? (short.host || short.rest)}
      </span>
      {label
        ? short.host && <span className="ml-2 text-sm text-ink-400">{short.host}</span>
        : short.host && short.rest && <span className="ml-1 text-ink-400">{short.rest}</span>}
    </span>
  );
}

function IconDownload({ className }: { className?: string }) {
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
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

/** 글 상세 화면. 게시판 종류와 무관하게 같은 구성을 쓴다. */
export default async function PostDetailView({
  board,
  id,
}: {
  board: BoardConfig;
  id: string;
}) {
  const post = await getPostCached(board.slug, Number(id));
  if (!post) notFound();

  const session = await getSession();
  const isAdmin = session?.role === "admin";
  /* 회원 전용 글은 로그인해야 본문과 첨부를 볼 수 있다. */
  const canRead = !post.isLocked || session !== null;
  const { prev, next } = await getNeighbors(board.slug, post.id);

  const base = board.basePath;
  /*
    머리에 붙는 상태 딱지.
    행사는 여는 날이 있어 접수중·예정·종료로 나뉘고, 사업공고는 마감만 있어
    접수중·마감 둘뿐이다. 계산이 다르므로 각자 함수를 쓴다.
  */
  const status = board.hasEventFields
    ? eventStatus(post.event)
    : board.hasDeadlineFields
      ? noticeStatus(post.event)
      : null;
  const period = formatEventPeriod(post.event.startsOn, post.event.endsOn);

  /* 행사·공고 정보는 값이 있는 항목만 줄로 만든다. */
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
    : board.recruit
      ? [
          { label: "분야", value: post.category ?? "" },
          {
            label: deadlineWords(board).period,
            value: formatApplyPeriod(post.event.applyFrom, post.event.applyBy) || "상시 모집",
          },
        ].filter((row) => row.value)
    : board.hasDeadlineFields
      ? [
          { label: "주관기관", value: post.event.host ?? "" },
          { label: "전문기관", value: agencyName(post.event.agency, post.event.agencyAbbr) },
          {
            label: "접수 기간",
            value: post.event.applyBy
              ? formatApplyPeriod(post.event.applyFrom, post.event.applyBy)
              : `${formatApplyPeriod(post.event.applyFrom, null)} 상시 접수`.trim(),
          },
        ].filter((row) => row.value)
      : [];

  return (
    /* 글 제목이 이 화면의 h1 이다. 머리의 게시판 이름까지 h1 이면 한 화면에 제목이 둘이 된다 */
    <PageShell href={base} title={board.name} titleAs="p">
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
                {/* 사업공고는 '접수', 강사 모집은 '모집'으로 적는다(행사는 그대로) */}
                {board.hasDeadlineFields && !board.hasEventFields
                  ? deadlineWords(board).status[status as NoticeStatus]
                  : status}
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
          /*
            주소를 그대로 보여 주면 한글이 '%ED%81…' 로 인코딩되어 한 줄을 다 채웠다.
            사이트 이름을 앞에 두고 나머지는 풀어서 짧게 자른다(url-display.ts).
            전체 주소는 마우스를 올리면 보인다.
          */
          <a
            href={post.link.url}
            target="_blank"
            rel="noreferrer noopener"
            title={post.link.url}
            className="group mt-6 flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-brand-500 hover:bg-brand-50/50"
          >
            <span className="shrink-0 rounded bg-white px-2 py-1 text-2xs font-bold text-flame-600 ring-1 ring-line">
              링크
            </span>
            <LinkText url={post.link.url} label={post.link.label} />
            <IconArrow className="size-4 shrink-0 text-ink-400 transition-colors group-hover:text-brand-500" />
          </a>
        )}

        {canRead ? (
          <>
            {post.attachments.length > 0 && (
              /*
                첨부파일. 전에는 클립 아이콘과 이름 한 줄이라 본문 위에서 눈에 잘 띄지 않았다.
                파일 종류 딱지와 내려받기 단추를 둔 상자로 보여 준다.
              */
              <section aria-label="첨부파일" className="mt-8 border-b border-line pb-6">
                <p className="mb-3 flex items-center gap-1.5 text-base font-bold text-navy-900">
                  <IconClip className="size-4 text-ink-400" />
                  첨부파일
                  <span className="text-brand-600">{post.attachments.length}</span>
                </p>
                <ul className="space-y-2">
                  {post.attachments.map((a) => {
                    const kind = fileKind(a.filename);
                    return (
                      <li key={a.id}>
                        <a
                          href={`/api/attachments/${a.id}`}
                          className="group flex items-center gap-4 rounded-lg border border-line bg-white px-4 py-3 transition-colors hover:border-brand-500 hover:bg-brand-50/40"
                        >
                          <span
                            className={`grid h-10 w-11 shrink-0 place-items-center rounded-md text-xs font-bold ${kind.tone}`}
                          >
                            {kind.label}
                          </span>
                          <span className="min-w-0 flex-1">
                            {/* 밑줄(_)로 이은 긴 이름은 띄어쓰기가 없어 줄이 안 넘어가므로 아무 데서나 끊는다 */}
                            <span className="line-clamp-2 text-base font-semibold text-navy-900 [overflow-wrap:anywhere] group-hover:text-brand-600">
                              {a.filename}
                            </span>
                            <span className="label-mono text-sm text-ink-400">{formatBytes(a.byteSize)}</span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 text-sm font-bold text-white transition-colors group-hover:bg-navy-900">
                            <IconDownload className="size-4" />
                            <span className="hidden sm:inline">내려받기</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {post.body ? (
              /*
                본문은 저장할 때 허용 태그만 남기고 걸러 둔다(sanitizePostBody).
                편집기가 생기기 전에 쓴 글은 태그가 없으므로 줄바꿈만 살려 보여준다.
              */
              isHtml(post.body) ? (
                /* 포토갤러리는 사진을 눌러 크게 넘겨 본다 */
                board.layout === "gallery" ? (
                  <GalleryBody html={post.body} />
                ) : (
                  <div
                    className="rich-text py-10"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                  />
                )
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
