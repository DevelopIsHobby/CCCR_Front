import type { Metadata } from "next";
import PromoList from "@/components/admin/PromoList";
import { listPromos } from "@/lib/db/promos";
import { PROMO_STATUS_LABEL, type PromoStatus } from "@/lib/promo-types";

export const metadata: Metadata = { title: "홍보 신청" };

const FILTERS: { value: PromoStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "new", label: PROMO_STATUS_LABEL.new },
  { value: "reading", label: PROMO_STATUS_LABEL.reading },
  { value: "running", label: PROMO_STATUS_LABEL.running },
  { value: "done", label: PROMO_STATUS_LABEL.done },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | PromoStatus
    | "all";

  const [promos, all] = await Promise.all([listPromos({ status }), listPromos()]);

  const counts = {
    all: all.length,
    new: all.filter((p) => p.status === "new").length,
    reading: all.filter((p) => p.status === "reading").length,
    running: all.filter((p) => p.status === "running").length,
    done: all.filter((p) => p.status === "done").length,
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">홍보 신청</h1>
        <p className="mt-2 text-md text-ink-600">
          메인 화면에서 들어온 홍보 서비스 신청입니다. 올린 그림과 첨부는 내용을 펼치면 볼 수
          있습니다.
        </p>
      </div>

      <form method="get" className="mt-8 flex flex-wrap gap-1 rounded-full bg-surface p-1 sm:w-fit">
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
            <span className="ml-1.5 tabular-nums opacity-70">{counts[f.value]}</span>
          </button>
        ))}
      </form>

      <PromoList promos={promos} />
    </>
  );
}
