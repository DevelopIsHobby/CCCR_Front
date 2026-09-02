"use client";

import { useState, useTransition } from "react";
import { deletePromo, setPromoStatus } from "@/lib/db/promo-actions";
import {
  CADENCE_LABEL,
  PROMO_STATUS_LABEL,
  type PromoRequest,
  type PromoStatus,
} from "@/lib/promo-types";
import { formatBytes, formatDate } from "@/lib/format";

const STATUS_TONE: Record<PromoStatus, string> = {
  new: "bg-flame-500 text-white",
  reading: "bg-brand-600 text-white",
  running: "bg-navy-900 text-white",
  done: "bg-surface text-ink-400",
};

const ORDER: PromoStatus[] = ["new", "reading", "running", "done"];

const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-white";

function PromoCard({ promo }: { promo: PromoRequest }) {
  const [open, setOpen] = useState(promo.status === "new");
  const [pending, startSaving] = useTransition();

  return (
    <li className="rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-start gap-4 p-6">
        <span className={`shrink-0 rounded px-2.5 py-1 text-2xs font-bold ${STATUS_TONE[promo.status]}`}>
          {PROMO_STATUS_LABEL[promo.status]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-md font-bold leading-snug text-navy-900">{promo.subject}</p>
          <p className="mt-1.5 text-base text-ink-600">
            {promo.org} · {promo.name}
            {promo.position && <span className="text-ink-400"> {promo.position}</span>}
            <span className="label-mono ml-3 text-ink-400">{promo.email}</span>
            {promo.tel && (
              <span className="label-mono ml-3 tabular-nums text-ink-400">{promo.tel}</span>
            )}
          </p>
          <p className="label-mono mt-1.5 tabular-nums text-brand-600">
            {formatDate(promo.startOn)}부터 · {CADENCE_LABEL[promo.cadence]}
          </p>
        </div>

        {/* 홍보 그림은 작게라도 바로 보이는 편이 판단이 빠르다 */}
        {promo.imageUrl && (
          /* 크기를 미리 알 수 없는 그림이라 next/image 대신 img 를 쓴다 */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promo.imageUrl}
            alt=""
            className="h-20 w-32 shrink-0 rounded-lg border border-line object-cover"
          />
        )}
      </div>

      {open && (
        <div className="space-y-4 border-t border-line px-6 py-5">
          {promo.tagline && (
            <p className="rounded-lg bg-brand-50 px-4 py-3 text-md font-bold text-brand-700">
              “{promo.tagline}”
            </p>
          )}

          <p className="whitespace-pre-wrap text-md leading-[1.85] text-ink-700">{promo.body}</p>

          <div className="flex flex-wrap gap-3">
            {promo.imageUrl && (
              <a
                href={promo.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded px-3 py-2 text-base font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
              >
                홍보 이미지 원본 보기 ↗
              </a>
            )}
            {promo.file && (
              <a
                href={`/admin/promos/file/${promo.id}`}
                className="rounded px-3 py-2 text-base font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
              >
                {promo.file.name}
                <span className="label-mono ml-2 tabular-nums text-ink-400">
                  {formatBytes(promo.file.byteSize)}
                </span>
              </a>
            )}
          </div>
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

        <span className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-1 tabular-nums text-ink-400">
            신청 {formatDate(promo.createdAt)}
          </span>

          <a
            href={`mailto:${promo.email}?subject=${encodeURIComponent(
              `[한국클라우드컴퓨팅연구조합] ${promo.subject}`,
            )}`}
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-500/40 transition-colors hover:bg-brand-50"
          >
            메일 회신
          </a>

          {/* 이미 그 상태인 단추는 내놓지 않는다 */}
          {ORDER.filter((s) => s !== promo.status).map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() =>
                startSaving(async () => {
                  await setPromoStatus(promo.id, s);
                })
              }
              className={smallBtn}
            >
              {PROMO_STATUS_LABEL[s]}
            </button>
          ))}

          <form
            action={deletePromo}
            onSubmit={(e) => {
              if (!confirm("이 신청을 지울까요? 올린 그림과 첨부도 함께 지워집니다.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={promo.id} />
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

export default function PromoList({ promos }: { promos: PromoRequest[] }) {
  if (promos.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-line bg-surface px-6 py-20 text-center text-md text-ink-400">
        들어온 신청이 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {promos.map((p) => (
        <PromoCard key={p.id} promo={p} />
      ))}
    </ul>
  );
}
