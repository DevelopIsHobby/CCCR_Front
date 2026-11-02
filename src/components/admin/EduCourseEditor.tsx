"use client";

import { useActionState, useState } from "react";
import {
  deleteCourse,
  saveCourse,
  toggleCourse,
  type CourseFormState,
} from "@/lib/db/edu-course-actions";
import { AUDIENCES, courseStatus, formatRange, type CourseStatus, type EduCourse } from "@/lib/edu-course";
import { today } from "@/lib/format";
import ImagePicker from "@/components/admin/ImagePicker";
import CoursePoster from "@/components/CoursePoster";

/*
  교육 과정 편집기(관리자 → 교육 과정).
  메인의 'CCCR 아카데미' 영역에 무엇을 어떤 차례로 보일지는 날짜가 정한다(lib/edu-course.ts).
  접수중인 과정이 마감 가까운 순서로 먼저 나오므로 끌어 옮기는 순서는 두지 않는다.
*/

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";
const smallBtn =
  "rounded px-2.5 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-line transition-colors hover:bg-surface disabled:opacity-40";

const STATUS_TONE: Record<CourseStatus, string> = {
  접수중: "bg-flame-500 text-white",
  접수예정: "bg-brand-600 text-white",
  마감: "bg-surface text-ink-400",
};

function DateField({ name, label, value }: { name: string; label: string; value?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-bold text-navy-900">{label}</span>
      <input type="date" name={name} defaultValue={value ?? ""} required className={input} />
    </label>
  );
}

function CourseForm({ course, onDone }: { course?: EduCourse; onDone?: () => void }) {
  const [state, action, pending] = useActionState<CourseFormState, FormData>(
    async (prev, formData) => {
      const result = await saveCourse(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-6">
      {course && <input type="hidden" name="id" value={course.id} />}

      <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">과정 구분</span>
          <select name="audience" defaultValue={course?.audience ?? "재직자"} className={input}>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a} 교육
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">과정명</span>
          <input name="title" defaultValue={course?.title ?? ""} required maxLength={120} className={input} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">요약 (한 줄)</span>
          <input
            name="summary"
            defaultValue={course?.summary ?? ""}
            maxLength={60}
            placeholder="집체 · 4일 · 32시간"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-base font-bold text-navy-900">신청 링크 (아카데미)</span>
          <input
            name="href"
            defaultValue={course?.href ?? ""}
            placeholder="https://www.cccr-edu.or.kr/course/..."
            className={input}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <DateField name="applyFrom" label="접수 시작일" value={course?.applyFrom} />
        <DateField name="applyUntil" label="접수 마감일" value={course?.applyUntil} />
        <DateField name="startsOn" label="교육 시작일" value={course?.startsOn} />
        <DateField name="endsOn" label="교육 종료일" value={course?.endsOn} />
      </div>
      <p className="text-sm text-ink-400">
        접수 마감일 당일까지 &lsquo;접수중&rsquo;으로 보입니다. 접수중인 과정이 마감 가까운 순서로 메인에
        먼저 나오고, 마감된 과정은 메인에서 저절로 빠집니다.
      </p>

      <div>
        <span className="mb-1.5 block text-base font-bold text-navy-900">포스터 (선택)</span>
        <p className="mb-3 text-sm leading-relaxed text-ink-400">
          권장 크기 <b className="font-semibold text-ink-600">1200 × 750 px</b> (가로:세로 16:10). 비율이
          달라도 잘리지 않고 남는 곳은 배경색으로 채웁니다. 포스터가 없으면 과정명으로 포스터를 그려
          보여 줍니다.
        </p>
        <ImagePicker
          name="posterUrl"
          defaultValue={course?.posterUrl ?? ""}
          alt="과정 포스터"
          ratio="aspect-[16/10]"
          width="w-72"
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
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

function CourseRow({ course, now }: { course: EduCourse; now: string }) {
  const [editing, setEditing] = useState(false);
  const status = courseStatus(course, now);

  if (editing) {
    return (
      <li className="border-b border-line py-4">
        <CourseForm course={course} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-line py-4">
      <div className="w-[104px] shrink-0 overflow-hidden rounded-md ring-1 ring-line">
        <CoursePoster course={course} compact />
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${STATUS_TONE[status]}`}>
            {status}
          </span>
          <span className="inline-flex rounded bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-700">
            {course.audience}
          </span>
          {!course.isVisible && (
            <span className="inline-flex rounded bg-surface px-2 py-0.5 text-2xs font-bold text-ink-400">
              숨김
            </span>
          )}
          <span className="text-md font-bold text-navy-900">{course.title}</span>
        </p>
        <p className="mt-1 text-base text-ink-600">
          접수 {formatRange(course.applyFrom, course.applyUntil)}
          <span className="mx-2 text-line">|</span>
          교육 {formatRange(course.startsOn, course.endsOn)}
          {course.summary && (
            <>
              <span className="mx-2 text-line">|</span>
              {course.summary}
            </>
          )}
        </p>
        {course.href && <p className="label-mono mt-1 truncate text-ink-400">{course.href}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
          수정
        </button>
        <form action={toggleCourse}>
          <input type="hidden" name="id" value={course.id} />
          <button type="submit" className={smallBtn}>
            {course.isVisible ? "숨기기" : "보이기"}
          </button>
        </form>
        <form
          action={deleteCourse}
          onSubmit={(e) => {
            if (!confirm(`'${course.title}' 과정을 삭제할까요?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={course.id} />
          <button
            type="submit"
            className="rounded px-2.5 py-1.5 text-sm font-semibold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100"
          >
            삭제
          </button>
        </form>
      </div>
    </li>
  );
}

export default function EduCourseEditor({ courses }: { courses: EduCourse[] }) {
  const [adding, setAdding] = useState(false);
  const now = today();

  return (
    <section className="rounded-xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900">교육 과정 {courses.length}개</h2>
          <p className="mt-1 text-base text-ink-600">교육이 늦게 시작하는 과정이 위에 옵니다.</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full bg-navy-900 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
          >
            과정 추가
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-5">
          <CourseForm onDone={() => setAdding(false)} />
        </div>
      )}

      {courses.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line py-10 text-center text-base text-ink-400">
          등록한 과정이 없습니다. &lsquo;과정 추가&rsquo;로 아카데미 과정을 넣어 주세요.
        </p>
      ) : (
        <ul className="mt-4">
          {courses.map((c) => (
            <CourseRow key={c.id} course={c} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}
