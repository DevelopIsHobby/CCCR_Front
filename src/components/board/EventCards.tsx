import Link from "next/link";
import { IconArrow, IconClip, IconLock } from "@/components/Icons";
import type { PostRow } from "@/lib/db/posts";
import { emptyMessage, PinnedBadge, withPinned } from "./BoardTable";
import { eventStatus, formatDate, formatEventPeriod, type EventStatus } from "@/lib/format";

const STATUS_TONE: Record<EventStatus, string> = {
  접수중: "bg-flame-500 text-white",
  예정: "bg-brand-600 text-white",
  종료: "bg-surface text-ink-400",
};

/*
  행사정보 목록.
  표보다 카드가 낫다. 제목만으로는 갈 수 있는 행사인지 알 수 없고,
  일시·장소·접수 여부를 함께 봐야 판단이 되기 때문이다.
*/
export default function EventCards({
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
    <ul className="mt-8 space-y-4">
      {all.map(({ post, pinned: isPinnedRow }) => {
        const status = eventStatus(post.event);
        const period = formatEventPeriod(post.event.startsOn, post.event.endsOn);
        const ended = status === "종료";

        return (
          <li key={`${isPinnedRow ? "pin" : "row"}-${post.id}`}>
            <Link
              href={`${base}/${post.id}`}
              className={`group grid gap-6 rounded-xl border border-line bg-white p-7 transition-all lg:grid-cols-[1fr_auto] lg:items-center ${
                ended
                  ? "opacity-70 hover:opacity-100"
                  : "hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {isPinnedRow && <PinnedBadge />}
                  {status && (
                    <span
                      className={`inline-flex rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[status]}`}
                    >
                      {status}
                    </span>
                  )}
                  {post.event.host && (
                    <span className="text-sm text-ink-400">주최 · {post.event.host}</span>
                  )}
                  {post.isLocked && (
                    <IconLock className="size-3.5 text-ink-400" aria-label="회원 전용" />
                  )}
                  {post.attachmentCount > 0 && (
                    <IconClip className="size-3.5 text-ink-400" aria-label="첨부파일 있음" />
                  )}
                </div>

                <p className="mt-3 text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                  {post.title}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {period ? (
                    <span className="label-mono tabular-nums text-brand-600">{period}</span>
                  ) : (
                    <span className="label-mono tabular-nums text-ink-400">
                      등록 {formatDate(post.createdAt)}
                    </span>
                  )}
                  {post.event.place && (
                    <span className="text-base text-ink-600">{post.event.place}</span>
                  )}
                  {/* 마감일이 지난 뒤에도 남겨 두면 아직 신청할 수 있는 것처럼 읽힌다 */}
                  {post.event.applyBy && status === "접수중" && (
                    <span className="text-base text-ink-400">
                      신청 마감 {formatDate(post.event.applyBy)}
                    </span>
                  )}
                </div>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink-400 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                <IconArrow className="size-4" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
