import type { Metadata } from "next";
import {
  PageHead,
  StatCard,
  btnPrimary,
  inputBox,
  pillClass,
  pillGroup,
} from "@/components/admin/AdminUi";
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

  const exportHref =
    status === "all" ? "/admin/newsletter/export" : `/admin/newsletter/export?status=${status}`;

  return (
    <div className="space-y-6">
      <PageHead
        title="뉴스레터 구독자"
        desc="메인 하단 띠와 뉴스레터 화면에서 신청한 주소가 모입니다. 회원가입 시 수신에 동의한 주소도 함께 담깁니다. 발송은 내려받은 명단으로 오즈메일러에서 합니다."
        actions={
          <a href={exportHref} className={btnPrimary}>
            엑셀(CSV) 내려받기
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="구독 중" value={counts.active} unit="명" />
        <StatCard label="해지" value={counts.unsubscribed} unit="명" />
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <div className={pillGroup}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="submit"
              name="status"
              value={f.value}
              aria-pressed={status === f.value}
              className={pillClass(status === f.value)}
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
            className={`w-full max-w-xs ${inputBox}`}
          />
          <button type="submit" className={btnPrimary}>
            검색
          </button>
        </div>
      </form>

      {q && (
        <p className="text-base text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과 {subscribers.length}건
        </p>
      )}

      <SubscriberTable subscribers={subscribers} />
    </div>
  );
}
