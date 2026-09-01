"use client";

import { useActionState } from "react";
import {
  saveSiteSettings,
  type SiteSettingsState,
} from "@/lib/db/site-settings-actions";
import {
  JOIN_CONTACT_FIELDS,
  MAP_FIELDS,
  SITE_FIELDS,
  type SiteSettings,
} from "@/lib/site-settings-types";

const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<SiteSettingsState, FormData>(
    saveSiteSettings,
    {},
  );

  return (
    <form action={action} className="mt-8 space-y-5 rounded-xl bg-surface p-6 lg:p-8">
      <p className="text-md font-bold text-navy-900">푸터 표기</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {SITE_FIELDS.map((field) => (
          <label key={field.key} className={`block ${field.wide ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block text-base font-bold text-navy-900">{field.label}</span>
            <input
              name={field.key}
              defaultValue={settings[field.key]}
              placeholder={field.placeholder}
              className={input}
            />
            {field.help && <span className="mt-1.5 block text-sm text-ink-400">{field.help}</span>}
          </label>
        ))}
      </div>

      <p className="border-t border-line pt-5 text-md font-bold text-navy-900">
        회원사 가입안내 · 입금계좌와 문의처
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {JOIN_CONTACT_FIELDS.map((field) => (
          <label key={field.key} className={`block ${field.wide ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block text-base font-bold text-navy-900">{field.label}</span>
            <input
              name={field.key}
              defaultValue={settings[field.key]}
              placeholder={field.placeholder}
              className={input}
            />
          </label>
        ))}
      </div>

      <p className="border-t border-line pt-5 text-md font-bold text-navy-900">
        찾아오시는 길 · 지도
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {MAP_FIELDS.map((field) => (
          <label key={field.key} className={`block ${field.wide ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block text-base font-bold text-navy-900">{field.label}</span>
            <input
              name={field.key}
              defaultValue={settings[field.key]}
              placeholder={field.placeholder}
              className={input}
            />
            {field.help && (
              <span className="mt-1.5 block text-sm leading-relaxed text-ink-400">{field.help}</span>
            )}
          </label>
        ))}
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
          {state.ok}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy-900 px-7 py-3 text-md font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
