import Link from "next/link";
import type { EventInfo, PostRow } from "@/lib/db/posts";
import { agencyName, formatApplyPeriod, noticeStatus, type NoticeStatus } from "@/lib/format";
import { PinnedBadge, TitleCell, emptyMessage, withPinned } from "./BoardTable";
import { IconExternal } from "./NewsLinks";

/*
  사업공고 목록.

  공지사항 표와 다른 점은 보여 주는 것이다. 공고를 훑는 사람이 알고 싶은 것은
  '아직 넣을 수 있나'와 '어디서 내는 공고인가'이지 글 번호나 조회수가 아니다.
  그래서 번호·글쓴이·조회를 빼고 그 자리에 상태·주관기관·마감일을 둔다.

  마감이 지난 공고도 지우지 않고 남긴다. 지난해 공고를 찾아보는 분이 있고,
  같은 사업이 해마다 나오므로 지난 공고가 참고가 된다. 대신 흐리게 두어
  접수중인 것이 먼저 눈에 들어오게 한다.
*/

const BADGE_TONE: Record<NoticeStatus, string> = {
  접수예정: "bg-white text-navy-900 ring-1 ring-line",
  접수중: "bg-brand-50 text-brand-700",
  마감: "bg-surface text-ink-400",
};

function StatusBadge({ event }: { event: EventInfo }) {
  const status = noticeStatus(event);
  if (!status) {
    /* 마감일이 없는 공고(상시 접수 등). 모르는 것을 단정하지 않는다 */
    return <span className="text-2xs text-ink-400">—</span>;
  }
  return (
    <span className={`inline-flex whitespace-nowrap rounded px-2.5 py-1 text-2xs font-bold ${BADGE_TONE[status]}`}>
      {status}
    </span>
  );
}

/*
  주관기관과 전문기관. 부처가 주관하고 전문기관이 접수하는 공고가 많아 둘을 함께 둔다.
  칸이 좁아 전문기관은 약어가 있으면 약어로 쓰고, 마우스를 올리면 이름이 보인다.
*/
function AgencyCell({
  host,
  agency,
  abbr,
}: {
  host: string | null;
  agency: string | null;
  abbr: string | null;
}) {
  const short = abbr || agency;
  if (!host && !short) return <>—</>;
  return (
    <>
      {host && <span className="block">{host}</span>}
      {short && (
        <span
          className="mt-0.5 block text-sm text-ink-400"
          title={abbr && agency ? agencyName(agency, abbr) : undefined}
        >
          전문 · {short}
        </span>
      )}
    </>
  );
}

export default function NoticeTable({
  base,
  pinned,
  rows,
  searching,
  isAdmin = false,
}: {
  base: string;
  pinned: PostRow[];
  rows: PostRow[];
  searching: boolean;
  isAdmin?: boolean;
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
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-y-2 border-navy-900">
            <th className="w-24 px-3 py-4 text-center text-base font-bold text-navy-900">상태</th>
            <th className="w-44 px-3 py-4 text-base font-bold text-navy-900">주관·전문기관</th>
            <th className="px-3 py-4 text-base font-bold text-navy-900">공고명</th>
            <th className="w-56 px-3 py-4 text-center text-base font-bold text-navy-900">
              접수 기간
            </th>
          </tr>
        </thead>
        <tbody>
          {all.map(({ post, pinned: isPinned }) => {
            const closed = noticeStatus(post.event) === "마감";
            return (
              <tr
                key={post.id}
                className={`border-b border-line transition-colors hover:bg-surface ${
                  closed ? "text-ink-400" : ""
                }`}
              >
                <td className="px-3 py-4 text-center">
                  {isPinned ? <PinnedBadge /> : <StatusBadge event={post.event} />}
                </td>
                <td className="px-3 py-4 text-base text-ink-600">
                  <AgencyCell
                    host={post.event.host}
                    agency={post.event.agency}
                    abbr={post.event.agencyAbbr}
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* 원문 주소가 있으면 주관기관 공고로 바로 보낸다. 원문 없이 올린 옛 글은 사이트 안 글 화면으로 */}
                    {post.link?.url ? (
                      <a
                        href={post.link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex min-w-0 items-start gap-1.5"
                      >
                        <TitleCell post={post} />
                        <IconExternal className="mt-1.5 size-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600" />
                        <span className="sr-only"> (공고 원문, 새 창)</span>
                      </a>
                    ) : (
                      <Link href={`${base}/${post.id}`} className="group block min-w-0">
                        <TitleCell post={post} />
                      </Link>
                    )}
                    {/* 제목이 바깥으로 나가므로 고치는 길을 목록에 둔다 */}
                    {isAdmin && (
                      <Link
                        href={`${base}/${post.id}/edit`}
                        className="shrink-0 text-sm font-semibold text-brand-600 hover:underline"
                      >
                        수정
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="data-line whitespace-nowrap tabular-nums text-ink-600">
                    {formatApplyPeriod(post.event.applyFrom, post.event.applyBy) || "상시"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
