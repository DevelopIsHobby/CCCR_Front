import type { Metadata } from "next";
import Link from "next/link";
import ProposalList from "@/components/admin/ProposalList";
import { listProposals } from "@/lib/db/outreach";
import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from "@/lib/outreach-types";

export const metadata: Metadata = { title: "교육사업 제안" };

const FILTERS: { value: ProposalStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "new", label: PROPOSAL_STATUS_LABEL.new },
  { value: "reading", label: PROPOSAL_STATUS_LABEL.reading },
  { value: "done", label: PROPOSAL_STATUS_LABEL.done },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as
    | ProposalStatus
    | "all";

  const [proposals, all] = await Promise.all([listProposals({ status }), listProposals()]);

  const counts = {
    all: all.length,
    new: all.filter((p) => p.status === "new").length,
    reading: all.filter((p) => p.status === "reading").length,
    done: all.filter((p) => p.status === "done").length,
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">교육사업 제안</h1>
          <p className="mt-2 text-md text-ink-600">
            주요사업 화면에서 들어온 교육사업 협력 제안입니다. 확인한 것은 상태를 옮겨 두면 새
            제안만 골라 볼 수 있습니다.
          </p>
        </div>

        <Link
          href="/business/programs"
          target="_blank"
          className="rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          접수 화면 보기 ↗
        </Link>
      </div>

      <form method="get" className="mt-8 flex gap-1 rounded-full bg-surface p-1 sm:w-fit">
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

      <ProposalList proposals={proposals} />
    </>
  );
}
