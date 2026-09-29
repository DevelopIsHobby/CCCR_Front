import Link from "next/link";
import type { PostRow } from "@/lib/db/posts";
import { formatDate, noticeStatus } from "@/lib/format";
import { PinnedBadge, TitleCell, emptyMessage, withPinned } from "./BoardTable";

/*
  사업공고 목록.

  공지사항 표와 다른 점은 보여 주는 것이다. 공고를 훑는 사람이 알고 싶은 것은
  '아직 넣을 수 있나'와 '어디서 내는 공고인가'이지 글 번호나 조회수가 아니다.
  그래서 번호·글쓴이·조회를 빼고 그 자리에 상태·주관기관·마감일을 둔다.

  마감이 지난 공고도 지우지 않고 남긴다. 지난해 공고를 찾아보는 분이 있고,
  같은 사업이 해마다 나오므로 지난 공고가 참고가 된다. 대신 흐리게 두어
  접수중인 것이 먼저 눈에 들어오게 한다.
*/

function StatusBadge({ applyBy }: { applyBy: string | null }) {
  const status = noticeStatus(applyBy);
  if (!status) {
    /* 마감일이 없는 공고(상시 접수 등). 모르는 것을 단정하지 않는다 */
    return <span className="text-2xs text-ink-400">—</span>;
  }
  return status === "접수중" ? (
    <span className="inline-flex rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
      접수중
    </span>
  ) : (
    <span className="inline-flex rounded bg-surface px-2.5 py-1 text-2xs font-bold text-ink-400">
      마감
    </span>
  );
}

export default function NoticeTable({
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
      <p className="rounded-xl border border-dashed border-line bg-white py-16 text-center text-md text-ink-400">
        {emptyMessage(searching)}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-y-2 border-navy-900">
            <th className="w-24 px-3 py-4 text-center text-base font-bold text-navy-900">상태</th>
            <th className="w-40 px-3 py-4 text-base font-bold text-navy-900">주관기관</th>
            <th className="px-3 py-4 text-base font-bold text-navy-900">공고명</th>
            <th className="w-32 px-3 py-4 text-center text-base font-bold text-navy-900">
              접수 마감
            </th>
          </tr>
        </thead>
        <tbody>
          {all.map(({ post, pinned: isPinned }) => {
            const closed = noticeStatus(post.event.applyBy) === "마감";
            return (
              <tr
                key={post.id}
                className={`border-b border-line transition-colors hover:bg-surface ${
                  closed ? "text-ink-400" : ""
                }`}
              >
                <td className="px-3 py-4 text-center">
                  {isPinned ? <PinnedBadge /> : <StatusBadge applyBy={post.event.applyBy} />}
                </td>
                <td className="px-3 py-4 text-base text-ink-600">{post.event.host ?? "—"}</td>
                <td className="px-3 py-4">
                  <Link href={`${base}/${post.id}`} className="group block">
                    <TitleCell post={post} />
                  </Link>
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="data-line tabular-nums text-ink-600">
                    {post.event.applyBy ? formatDate(post.event.applyBy) : "상시"}
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
