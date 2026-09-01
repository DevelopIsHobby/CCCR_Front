import type { Metadata } from "next";
import SubscriberTable from "@/components/admin/SubscriberTable";
import { countSubscribers, listSubscribers, type SubscriberStatus } from "@/lib/db/newsletter";

export const metadata: Metadata = { title: "뉴스레터 구독자" };

const FILTERS: { value: SubscriberStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "구독 중" },
  { value: "unsubscribed", label: "해지" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | SubscriberStatus
    | "all";

  const [subscribers, counts] = await Promise.all([
    listSubscribers({ q, status }),
    countSubscribers(),
  ]);

  const exportHref = status === "all" ? "/admin/newsletter/export" : `/admin/newsletter/export?status=${status}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">뉴스레터 구독자</h1>
          <p className="mt-2 text-md text-ink-600">
            메인 하단 띠와 뉴스레터 화면에서 신청한 주소가 모입니다. 회원가입 시 수신에 동의한
            주소도 함께 담깁니다. 발송은 내려받은 명단으로 오즈메일러에서 합니다.
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
          { label: "구독 중", value: counts.active },
          { label: "해지", value: counts.unsubscribed },
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
          <label htmlFor="subscriber-q" className="sr-only">
            검색어
          </label>
          <input
            id="subscriber-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="이메일 검색"
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
        <SubscriberTable subscribers={subscribers} />
      </div>

    </>
  );
}
