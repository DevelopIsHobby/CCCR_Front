"use client";

import { MEMBER_TYPES, MEMBER_TYPE_HINT, MEMBER_TYPE_LABEL, type MemberType } from "@/lib/user-types";

/*
  회원 유형 고르기(개인회원 · 기업회원).

  이메일 가입은 첫 단계 카드로 고르므로 쓰지 않는다. 소셜 로그인 단추로 바로 와서
  아직 유형을 고르지 않은 사람의 가입 화면에서 쓴다. 고르는 대로 입력칸이 바뀌므로
  값을 부르는 쪽이 들고 있다.
*/
export default function MemberTypeField({
  id = "member-type",
  value,
  onChange,
}: {
  id?: string;
  value: MemberType | null;
  onChange: (t: MemberType) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={id} className="grid gap-2 sm:grid-cols-2">
      <span id={id} className="sr-only">
        회원 유형
      </span>
      {MEMBER_TYPES.map((t) => (
        <label
          key={t}
          className="flex cursor-pointer items-start gap-2.5 rounded-md border border-line px-4 py-3 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
        >
          <input
            type="radio"
            name="memberType"
            value={t}
            required
            checked={value === t}
            onChange={() => onChange(t)}
            className="mt-1 size-4 shrink-0 accent-brand-600"
          />
          <span>
            <span className="block text-md font-semibold text-navy-900">{MEMBER_TYPE_LABEL[t]}</span>
            <span className="mt-0.5 block text-sm leading-snug text-ink-400">{MEMBER_TYPE_HINT[t]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
