"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteDepartment,
  reorderDepartments,
  saveDepartment,
  type AboutState,
} from "@/lib/db/about-actions";
import type { Department } from "@/lib/about-content-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface";

function DepartmentForm({
  department,
  onDone,
}: {
  department?: Department;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<AboutState, FormData>(async (prev, formData) => {
    const result = await saveDepartment(prev, formData);
    if (result.ok) onDone?.();
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-5">
      {department && <input type="hidden" name="id" value={department.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">부서</span>
          <input name="name" defaultValue={department?.name ?? ""} required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">연락처</span>
          <input
            name="tel"
            defaultValue={department?.tel ?? ""}
            placeholder="02-0000-0000"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">E-mail</span>
          <input
            name="email"
            type="email"
            defaultValue={department?.email ?? ""}
            className={input}
          />
        </label>
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
          {pending ? "저장 중…" : department ? "수정" : "추가"}
        </button>
      </div>
    </form>
  );
}

function DepartmentRow({
  department,
  dragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  department: Department;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border-b border-line py-3">
        <DepartmentForm department={department} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(department.id));
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

      <span className="min-w-0 flex-1">
        <span className="text-md font-bold text-navy-900">{department.name}</span>
        {department.tel && (
          <span className="label-mono ml-3 tabular-nums text-ink-600">{department.tel}</span>
        )}
        {department.email && (
          <span className="label-mono ml-3 text-ink-400">{department.email}</span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form
          action={deleteDepartment}
          onSubmit={(e) => {
            if (!confirm(`${department.name}을(를) 지울까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={department.id} />
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

export default function DepartmentEditor({ departments }: { departments: Department[] }) {
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(departments);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startSaving] = useTransition();

  const [lastDepartments, setLastDepartments] = useState(departments);
  if (lastDepartments !== departments) {
    setLastDepartments(departments);
    setOrder(departments);
  }

  const moveTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;

    setOrder((prev) => {
      const from = prev.findIndex((d) => d.id === draggingId);
      const to = prev.findIndex((d) => d.id === targetId);
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

    const ids = order.map((d) => d.id);
    if (departments.every((d, i) => d.id === ids[i])) return;

    startSaving(async () => {
      await reorderDepartments(ids);
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(6,42,85,0.04)] lg:p-6">
      <div className="-mx-5 -mt-5 mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900">부서별 연락처</h2>
          <p className="mt-1.5 text-base text-ink-600">
            조직도 화면의 표에 이 차례 그대로 나옵니다.
          </p>
        </div>
        <span className="data-line text-ink-400">{departments.length}곳 · 끌어서 순서 변경</span>
      </div>

      <ul>
        {order.length === 0 && (
          <li className="border-b border-line py-10 text-center text-md text-ink-400">
            등록된 부서가 없습니다.
          </li>
        )}
        {order.map((department) => (
          <DepartmentRow
            key={department.id}
            department={department}
            dragging={draggingId === department.id}
            onDragStart={() => setDraggingId(department.id)}
            onDragEnter={() => moveTo(department.id)}
            onDragEnd={commit}
          />
        ))}
      </ul>

      {adding ? (
        <div className="mt-5">
          <DepartmentForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 rounded-full px-5 py-2.5 text-base font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
        >
          + 부서 추가
        </button>
      )}
    </section>
  );
}
