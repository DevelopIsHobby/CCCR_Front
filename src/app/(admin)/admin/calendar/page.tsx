import type { Metadata } from "next";
import Link from "next/link";
import { IconExternal } from "@/components/admin/AdminIcons";
import { Note, PageHead, Panel } from "@/components/admin/AdminUi";
import CalendarEventEditor from "@/components/admin/CalendarEventEditor";
import { collectCalendar, getCalendarSettings, listCustomEvents } from "@/lib/db/calendar";
import { saveCalendarKinds, toggleCalendarHidden } from "@/lib/db/calendar-actions";
import { CALENDAR_KINDS, addMonths, type CalendarKind } from "@/lib/calendar";
import { today } from "@/lib/format";

export const metadata: Metadata = { title: "달력 일정 관리" };

const KIND_TONE: Record<CalendarKind, string> = {
  행사: "bg-flame-100 text-flame-700",
  교육: "bg-teal-50 text-teal-700",
  "공고 마감": "bg-brand-50 text-brand-700",
  "조합 일정": "bg-violet-50 text-violet-700",
};

/* 각 종류가 어디서 오는지. 고치는 곳을 바로 알려 준다 */
const KIND_SOURCE: Record<CalendarKind, { text: string; href: string }> = {
  행사: { text: "행사정보 글의 행사일", href: "/board/events" },
  교육: { text: "교육 과정의 교육 기간", href: "/admin/education" },
  "공고 마감": { text: "사업공고 글의 접수 마감일", href: "/board/announce" },
  "조합 일정": { text: "아래에서 직접 넣는 일정", href: "#custom" },
};

const fmt = (d: string) => d.slice(5).replace("-", ".");

export default async function Page() {
  const now = today();
  /* 메인 달력이 싣는 범위와 같다(NewsSection) */
  const from = `${addMonths(now.slice(0, 7), -1)}-01`;
  const to = `${addMonths(now.slice(0, 7), 4)}-01`;
  const [entries, settings, custom] = await Promise.all([
    collectCalendar(from, to),
    getCalendarSettings(),
    listCustomEvents(),
  ]);

  return (
    <div className="space-y-6">
      <PageHead
        title="달력 일정"
        desc="메인 화면 '조합 소식' 옆 일정 달력에 무엇을 보일지 정합니다."
        actions={
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <IconExternal className="size-4" />
            메인 화면 보기
          </Link>
        }
      />

      <Note>
        달력은 행사정보·사업공고 글과 교육 과정에서 저절로 채워집니다. 날짜를 고치려면 그 글이나 과정을
        고치세요. 여기서는 종류를 통째로 켜고 끄거나, 일정 하나만 달력에서 숨기거나(글은 그대로), 글이
        없는 일정을 직접 넣을 수 있습니다.
      </Note>

      <Panel title="보일 종류" desc="체크를 푼 종류는 메인 달력에서 모두 빠집니다.">
        <form action={saveCalendarKinds} className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {CALENDAR_KINDS.map((k) => (
            <label key={k} className="flex items-center gap-2 text-base text-ink-700">
              <input
                type="checkbox"
                name="kind"
                value={k}
                defaultChecked={!settings.off.has(k)}
                className="size-4 accent-brand-600"
              />
              <span className={`rounded px-2 py-0.5 text-sm font-bold ${KIND_TONE[k]}`}>{k}</span>
              <Link href={KIND_SOURCE[k].href} className="text-sm text-ink-400 hover:text-brand-600 hover:underline">
                {KIND_SOURCE[k].text}
              </Link>
            </label>
          ))}
          <button
            type="submit"
            className="ml-auto rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            저장
          </button>
        </form>
      </Panel>

      <div id="custom">
        <Panel
          title="직접 넣는 일정 (조합 일정)"
          desc="게시글이 없는 일정 — 정기총회·이사회·휴무 등. 달력에 보라색 점으로 나옵니다."
        >
          <CalendarEventEditor events={custom} />
        </Panel>
      </div>

      <Panel
        title="달력에 걸린 일정"
        desc={`${fmt(from)} ~ ${fmt(to)} 사이. 숨긴 일정은 메인 달력에서 빠지고 글·과정은 그대로 남습니다.`}
        bare
      >
        {entries.length === 0 ? (
          <p className="px-6 py-10 text-center text-md text-ink-400">이 기간에 걸린 일정이 없습니다.</p>
        ) : (
          <ul aria-label="달력에 걸린 일정">
            {entries.map((e) => {
              const hidden = settings.hidden.has(e.key);
              const kindOff = settings.off.has(e.kind);
              return (
                <li
                  key={e.key}
                  className={`flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0 lg:px-6 ${
                    hidden || kindOff ? "bg-surface/60" : ""
                  }`}
                >
                  <span className="label-mono w-28 shrink-0 tabular-nums text-ink-600">
                    {e.start === e.end ? fmt(e.start) : `${fmt(e.start)}~${fmt(e.end)}`}
                  </span>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${KIND_TONE[e.kind]}`}>
                    {e.kind}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-base ${
                      hidden || kindOff ? "text-ink-400 line-through" : "text-ink-900"
                    }`}
                  >
                    {e.title}
                  </span>
                  {kindOff ? (
                    <span className="shrink-0 text-sm text-ink-400">종류가 꺼져 있음</span>
                  ) : (
                    <form action={toggleCalendarHidden} className="shrink-0">
                      <input type="hidden" name="key" value={e.key} />
                      <button
                        type="submit"
                        aria-label={`${e.title} ${hidden ? "다시 보이기" : "숨기기"}`}
                        className="rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-white"
                      >
                        {hidden ? "다시 보이기" : "숨기기"}
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
