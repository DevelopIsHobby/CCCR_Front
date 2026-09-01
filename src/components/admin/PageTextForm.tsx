"use client";

import Link from "next/link";
import { useActionState } from "react";
import RichTextEditor from "@/components/board/RichTextEditor";
import ImagePicker from "./ImagePicker";
import { savePageTexts, type AboutState } from "@/lib/db/about-actions";
import type { PageTexts, TextGroup } from "@/lib/about-content-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";

/** 한 페이지의 문구를 묶어서 고친다. 칸 구성은 TEXT_GROUPS 가 정한다. */
export default function PageTextForm({
  group,
  texts,
}: {
  group: TextGroup;
  texts: PageTexts;
}) {
  const [state, action, pending] = useActionState<AboutState, FormData>(savePageTexts, {});

  return (
    <section className="mt-14 first:mt-0">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
        <h2 className="text-xl font-bold text-navy-900">{group.title}</h2>
        <Link
          href={group.href}
          target="_blank"
          className="text-base font-semibold text-brand-600 hover:underline"
        >
          화면에서 보기 ↗
        </Link>
      </div>

      <form action={action} className="mt-6 space-y-5 rounded-xl bg-surface p-6">
        {group.fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-base font-bold text-navy-900" htmlFor={field.key}>
              {field.label}
            </label>

            {field.kind === "rich" ? (
              <RichTextEditor name={field.key} defaultValue={texts[field.key] ?? ""} />
            ) : field.kind === "image" ? (
              <ImagePicker
                name={field.key}
                defaultValue={texts[field.key] ?? ""}
                alt={field.label}
              />
            ) : field.kind === "multiline" ? (
              <textarea
                id={field.key}
                name={field.key}
                rows={4}
                defaultValue={texts[field.key] ?? ""}
                className={`${input} leading-relaxed`}
              />
            ) : (
              <input
                id={field.key}
                name={field.key}
                defaultValue={texts[field.key] ?? ""}
                className={input}
              />
            )}

            {field.help && <p className="mt-1.5 text-sm text-ink-400">{field.help}</p>}
          </div>
        ))}

        {state.error && (
          <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
            저장했습니다. 화면에 바로 반영됩니다.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {pending ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </section>
  );
}
