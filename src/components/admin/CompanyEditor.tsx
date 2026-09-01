"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteCompany,
  moveCompanyGrade,
  reorderCompanies,
  saveCompany,
  toggleCompany,
  type CompanyFormState,
} from "@/lib/db/company-actions";
import ImagePicker from "./ImagePicker";
import { COMPANY_GRADES, type Company } from "@/lib/company-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

function CompanyForm({
  grade,
  company,
  onDone,
}: {
  grade: string;
  company?: Company;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<CompanyFormState, FormData>(
    async (prev, formData) => {
      const result = await saveCompany(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      {company && <input type="hidden" name="id" value={company.id} />}

      <div className="grid gap-4 sm:grid-cols-[160px_1fr_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">등급</span>
          <select name="grade" defaultValue={company?.grade ?? grade} className={input}>
            {COMPANY_GRADES.map((g) => (
              <option key={g.grade} value={g.grade}>
                {g.grade}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">회사명</span>
          <input name="name" defaultValue={company?.name ?? ""} required className={input} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">홈페이지</span>
          <input
            name="site"
            defaultValue={company?.site ?? ""}
            placeholder="www.example.com"
            className={input}
          />
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-base font-bold text-navy-900">로고</span>
        <ImagePicker
          name="logoUrl"
          defaultValue={company?.logoUrl ?? ""}
          alt="회원사 로고"
          ratio="aspect-[3/2]"
          width="w-40"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
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
          className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : company ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function CompanyRow({
  company,
  index,
  dragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  company: Company;
  index: number;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-3">
        <CompanyForm grade={company.grade} company={company} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(company.id));
        onDragStart();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      className={`flex cursor-grab flex-wrap items-center gap-3 border-b border-line py-2.5 transition-colors active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <span aria-hidden className="shrink-0 select-none px-1 text-ink-400">
        ⠿
      </span>
      <span className="label-mono w-8 shrink-0 tabular-nums text-ink-400">{index + 1}</span>

      {company.logoUrl && (
        /* 크기를 미리 알 수 없는 그림이라 next/image 대신 img 를 쓴다 */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.logoUrl}
          alt=""
          className="h-7 w-14 shrink-0 rounded border border-line bg-white object-contain"
        />
      )}

      <span className="min-w-0 flex-1">
        <span className="text-md font-bold text-navy-900">{company.name}</span>
        {!company.isVisible && (
          <span className="ml-2 rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-400">
            숨김
          </span>
        )}
        {company.site && (
          <span className="label-mono ml-2 text-ink-400">{company.site}</span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>

        {/* 등급 이동: 고른 등급의 맨 뒤로 옮긴다 */}
        <form action={moveCompanyGrade} className="flex items-center gap-1">
          <input type="hidden" name="id" value={company.id} />
          <select
            name="grade"
            defaultValue={company.grade}
            aria-label={`${company.name} 등급 이동`}
            className="rounded border border-line bg-white px-2 py-1.5 text-sm text-ink-700"
          >
            {COMPANY_GRADES.map((g) => (
              <option key={g.grade} value={g.grade}>
                {g.grade}
              </option>
            ))}
          </select>
          <button type="submit" className={smallBtn}>
            이동
          </button>
        </form>

        <form action={toggleCompany}>
          <input type="hidden" name="id" value={company.id} />
          <button type="submit" className={smallBtn}>
            {company.isVisible ? "숨기기" : "보이기"}
          </button>
        </form>

        <form
          action={deleteCompany}
          onSubmit={(e) => {
            if (!confirm(`${company.name}을(를) 명단에서 지울까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={company.id} />
          <button
            type="submit"
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
          >
            삭제
          </button>
        </form>
      </span>
    </li>
  );
}

export default function CompanyEditor({
  grade,
  desc,
  companies,
}: {
  grade: string;
  desc: string;
  companies: Company[];
}) {
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(companies);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  /* 서버에서 새 목록이 오면 그것으로 맞춘다 (렌더 중 조정) */
  const [lastCompanies, setLastCompanies] = useState(companies);
  if (lastCompanies !== companies) {
    setLastCompanies(companies);
    setOrder(companies);
  }

  const moveTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;

    setOrder((prev) => {
      const from = prev.findIndex((c) => c.id === draggingId);
      const to = prev.findIndex((c) => c.id === targetId);
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

    const ids = order.map((c) => c.id);
    if (companies.every((c, i) => c.id === ids[i])) return;

    startSaving(async () => {
      await reorderCompanies(grade, ids);
    });
  };

  return (
    <section className="mt-14 first:mt-0">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">{grade}</h2>
          <p className="mt-1.5 text-base text-ink-600">{desc}</p>
        </div>
        <span className="data-line text-ink-400">{companies.length}개사 · 끌어서 순서 변경</span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            등록된 회원사가 없습니다.
          </li>
        )}
        {order.map((company, i) => (
          <CompanyRow
            key={company.id}
            company={company}
            index={i}
            dragging={draggingId === company.id}
            onDragStart={() => setDraggingId(company.id)}
            onDragEnter={() => moveTo(company.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <CompanyForm grade={grade} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + {grade} 추가
        </button>
      )}
    </section>
  );
}
