"use client";

import { useState, useTransition } from "react";
import { deleteProposal, setProposalStatus } from "@/lib/db/outreach-actions";
import {
  PROPOSAL_STATUS_LABEL,
  type EducationProposal,
  type ProposalStatus,
} from "@/lib/outreach-types";
import { formatDate } from "@/lib/format";

const STATUS_TONE: Record<ProposalStatus, string> = {
  new: "bg-flame-500 text-white",
  reading: "bg-brand-600 text-white",
  done: "bg-surface text-ink-400",
};

const NEXT: Record<ProposalStatus, ProposalStatus> = {
  new: "reading",
  reading: "done",
  done: "new",
};

function ProposalCard({ proposal }: { proposal: EducationProposal }) {
  const [open, setOpen] = useState(proposal.status === "new");
  const [pending, startSaving] = useTransition();

  return (
    <li className="rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-start gap-4 p-6">
        <span
          className={`shrink-0 rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[proposal.status]}`}
        >
          {PROPOSAL_STATUS_LABEL[proposal.status]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-md font-bold leading-snug text-navy-900">{proposal.subject}</p>
          <p className="mt-1.5 text-base text-ink-600">
            {proposal.org} · {proposal.name}
            <span className="label-mono ml-3 text-ink-400">{proposal.email}</span>
            {proposal.tel && (
              <span className="label-mono ml-3 tabular-nums text-ink-400">{proposal.tel}</span>
            )}
          </p>
        </div>

        <span className="label-mono shrink-0 tabular-nums text-ink-400">
          {formatDate(proposal.createdAt)}
        </span>
      </div>

      {open && (
        <div className="border-t border-line px-6 py-5">
          <p className="whitespace-pre-wrap text-md leading-[1.85] text-ink-700">
            {proposal.body}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-6 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-base font-semibold text-ink-600 transition-colors hover:text-brand-600"
        >
          {open ? "내용 접기" : "내용 보기"}
        </button>

        <span className="flex items-center gap-2">
          <a
            href={`mailto:${proposal.email}?subject=${encodeURIComponent(`[한국클라우드컴퓨팅연구조합] ${proposal.subject}`)}`}
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
          >
            메일 회신
          </a>

          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startSaving(async () => {
                await setProposalStatus(proposal.id, NEXT[proposal.status]);
              })
            }
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-white disabled:opacity-60"
          >
            {PROPOSAL_STATUS_LABEL[NEXT[proposal.status]]}(으)로
          </button>

          <form
            action={deleteProposal}
            onSubmit={(e) => {
              if (!confirm("이 제안을 지울까요?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={proposal.id} />
            <button
              type="submit"
              className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
            >
              삭제
            </button>
          </form>
        </span>
      </div>
    </li>
  );
}

export default function ProposalList({ proposals }: { proposals: EducationProposal[] }) {
  if (proposals.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-line bg-surface px-6 py-11 text-center text-md text-ink-400">
        들어온 제안이 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </ul>
  );
}
