"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteOffice,
  deleteRelatedSite,
  reorderRelatedSites,
  saveOffice,
  saveRelatedSite,
  type SiteContentState,
} from "@/lib/db/site-content-actions";
import { TRANSIT_HELP, type Office, type RelatedSite } from "@/lib/site-content-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";
const deleteBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100";

/* ── 관련기관 ─────────────────────────────────────── */

function RelatedSiteForm({ site, onDone }: { site?: RelatedSite; onDone?: () => void }) {
  const [state, action, pending] = useActionState<SiteContentState, FormData>(
    async (prev, formData) => {
      const result = await saveRelatedSite(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-3 rounded-xl bg-surface p-5">
      {site && <input type="hidden" name="id" value={site.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">기관 이름</span>
          <input name="name" defaultValue={site?.name ?? ""} required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">주소</span>
          <input
            name="url"
            defaultValue={site?.url ?? ""}
            placeholder="https://www.example.go.kr"
            className={input}
          />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-2.5 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className={smallBtn}>
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-5 py-2 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : site ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function RelatedSiteRow({
  site,
  dragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  site: RelatedSite;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-3">
        <RelatedSiteForm site={site} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(site.id));
        onDragStart();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      className={`flex cursor-grab flex-wrap items-center gap-3 border-b border-line py-3 transition-colors active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <span aria-hidden className="shrink-0 select-none px-1 text-ink-400">
        ⠿
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-md font-bold text-navy-900">{site.name}</span>
        {site.url ? (
          <span className="label-mono ml-2 text-ink-400">{site.url}</span>
        ) : (
          <span className="ml-2 rounded bg-flame-100 px-2 py-0.5 text-2xs font-bold text-flame-700">
            주소 없음 · 화면에 안 나옴
          </span>
        )}
      </span>

      <span className="flex shrink-0 gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form
          action={deleteRelatedSite}
          onSubmit={(e) => {
            if (!confirm(`${site.name}을(를) 목록에서 지울까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={site.id} />
          <button type="submit" className={deleteBtn}>
            삭제
          </button>
        </form>
      </span>
    </li>
  );
}

export function RelatedSiteEditor({ sites }: { sites: RelatedSite[] }) {
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(sites);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  const [lastSites, setLastSites] = useState(sites);
  if (lastSites !== sites) {
    setLastSites(sites);
    setOrder(sites);
  }

  const moveTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;
    setOrder((prev) => {
      const from = prev.findIndex((s) => s.id === draggingId);
      const to = prev.findIndex((s) => s.id === targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const commit = () => {
    if (draggingId === null) return;
    setDraggingId(null);
    const ids = order.map((s) => s.id);
    if (sites.every((s, i) => s.id === ids[i])) return;
    startSaving(async () => {
      await reorderRelatedSites(ids);
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900">관련기관 바로가기</h2>
          <p className="mt-1.5 text-base text-ink-600">
            푸터 오른쪽 목록입니다. 주소를 넣은 기관만 화면에 나옵니다.
          </p>
        </div>
        <span className="data-line text-ink-400">{sites.length}곳 · 끌어서 순서 변경</span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-8 text-center text-md text-ink-400">
            등록된 기관이 없습니다.
          </li>
        )}
        {order.map((site) => (
          <RelatedSiteRow
            key={site.id}
            site={site}
            dragging={draggingId === site.id}
            onDragStart={() => setDraggingId(site.id)}
            onDragEnter={() => moveTo(site.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <RelatedSiteForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + 기관 추가
        </button>
      )}
    </section>
  );
}

/* ── 사무실 ───────────────────────────────────────── */

function OfficeForm({ office, onDone }: { office?: Office; onDone?: () => void }) {
  const [state, action, pending] = useActionState<SiteContentState, FormData>(
    async (prev, formData) => {
      const result = await saveOffice(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      {office && <input type="hidden" name="id" value={office.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-base font-bold text-navy-900">사무실 이름</span>
          <input name="name" defaultValue={office?.name ?? ""} required className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-base font-bold text-navy-900">주소</span>
          <input name="address" defaultValue={office?.address ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">전화</span>
          <input name="tel" defaultValue={office?.tel ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">팩스</span>
          <input name="fax" defaultValue={office?.fax ?? ""} className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-base font-bold text-navy-900">도보 안내</span>
          <input
            name="note"
            defaultValue={office?.note ?? ""}
            placeholder="○○역 4번 출구에서 …"
            className={input}
          />
          <span className="mt-1.5 block text-sm text-ink-400">지도 아래에 한 줄로 표시됩니다.</span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">위도</span>
          <input
            name="mapLat"
            defaultValue={office?.mapLat ?? ""}
            placeholder="37.123456"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">경도</span>
          <input
            name="mapLng"
            defaultValue={office?.mapLng ?? ""}
            placeholder="127.123456"
            className={input}
          />
          <span className="mt-1.5 block text-sm leading-relaxed text-ink-400">
            카카오맵에서 장소를 찾아 우클릭하면 좌표를 볼 수 있습니다. 좌표와 지도 키가 모두
            있어야 지도가 나옵니다.
          </span>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-base font-bold text-navy-900">교통편</span>
        <textarea
          name="transit"
          rows={10}
          defaultValue={office?.transit ?? ""}
          className={`${input} font-mono text-sm leading-relaxed`}
        />
        <span className="mt-1.5 block text-sm leading-relaxed text-ink-400">{TRANSIT_HELP}</span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-2.5 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className={smallBtn}>
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-5 py-2 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : office ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

export function OfficeEditor({ offices }: { offices: Office[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900">사무실</h2>
          <p className="mt-1.5 text-base text-ink-600">찾아오시는 길 화면에 나오는 정보입니다.</p>
        </div>
        <span className="data-line text-ink-400">{offices.length}곳</span>
      </div>

      <ul className="divide-y divide-line">
        {offices.map((office) => (
          <li key={office.id} className="py-4">
            {editingId === office.id ? (
              <OfficeForm office={office} onDone={() => setEditingId(null)} />
            ) : (
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-md font-bold text-navy-900">{office.name}</p>
                  <p className="mt-1 text-base text-ink-600">{office.address}</p>
                  <p className="label-mono mt-1 text-ink-400">
                    TEL {office.tel} · FAX {office.fax}
                  </p>
                  <p className="mt-1 text-base text-ink-400">
                    교통편 {office.transit.split(/\r?\n/).filter((l) => l.includes("|")).length}줄
                  </p>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingId(office.id)}
                    className={smallBtn}
                  >
                    수정
                  </button>
                  <form
                    action={deleteOffice}
                    onSubmit={(e) => {
                      if (!confirm(`${office.name}을(를) 지울까요?`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={office.id} />
                    <button type="submit" className={deleteBtn}>
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <OfficeForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + 사무실 추가
        </button>
      )}
    </section>
  );
}
