import type { Metadata } from "next";
import NoticeSubscriberTable from "@/components/admin/NoticeSubscriberTable";
import { countNoticeSubscribers, listNoticeSubscribers } from "@/lib/db/outreach";
import type { SubscribeStatus } from "@/lib/outreach-types";

export const metadata: Metadata = { title: "사업공고 수신자" };

const FILTERS: { value: SubscribeStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "수신 중" },
  { value: "unsubscribed", label: "중단" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | SubscribeStatus
    | "all";

  const [subscribers, counts] = await Promise.all([
    listNoticeSubscribers({ q, status }),
    countNoticeSubscribers(),
  ]);

  const exportHref =
    status === "all" ? "/admin/notices/export" : `/admin/notices/export?status=${status}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">사업공고 수신자</h1>
          <p className="mt-2 text-md text-ink-600">
            임원사 담당자가 사업공고 안내 화면에서 신청한 명단입니다. 매주 공고를 보낼 때 이
            명단을 내려받아 쓰세요.
          </p>
        </div>

        <a
          href={exportHref}
          className="rounded-full bg-navy-900 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          엑셀(CSV) 내려받기
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: "수신 중", value: counts.active },
          { label: "중단", value: counts.unsubscribed },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-line bg-surface p-6">
            <p className="text-base font-medium text-ink-600">{card.label}</p>
            <p className="label-mono mt-2 text-3xl font-bold tabular-nums leading-none text-navy-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <form method="get" className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="submit"
              name="status"
              value={f.value}
              aria-pressed={status === f.value}
              className={`rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                status === f.value ? "bg-navy-900 text-white" : "text-ink-600 hover:text-brand-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 justify-end gap-2">
          <label htmlFor="notice-q" className="sr-only">
            검색어
          </label>
          <input
            id="notice-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="회사명 · 담당자 · 이메일"
            className="w-full max-w-xs rounded-md border border-line px-4 py-2.5 text-base outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
          >
            검색
          </button>
        </div>
      </form>

      {q && (
        <p className="mt-4 text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {subscribers.length}건
        </p>
      )}

      <div className="mt-6">
        <NoticeSubscriberTable subscribers={subscribers} />
      </div>
    </>
  );
}
