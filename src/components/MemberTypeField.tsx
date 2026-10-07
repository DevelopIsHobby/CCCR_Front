import { MEMBER_TYPES, MEMBER_TYPE_HINT } from "@/lib/user-types";

/*
  회원 구분 고르기(회원사 · 비회원사 · 유관기관).
  이메일 가입과 소셜 가입 화면이 함께 쓴다. 사무국이 승인할 때 회원사인지 바로 알 수 있게 한다.
*/
export default function MemberTypeField({ id = "member-type" }: { id?: string }) {
  return (
    <div>
      <p id={id} className="mb-2 block text-base font-bold text-navy-900">
        회원 구분
      </p>
      <div role="radiogroup" aria-labelledby={id} className="grid gap-2 sm:grid-cols-3">
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
              className="mt-1 size-4 shrink-0 accent-brand-600"
            />
            <span>
              <span className="block text-md font-semibold text-navy-900">{t}</span>
              <span className="mt-0.5 block text-sm leading-snug text-ink-400">{MEMBER_TYPE_HINT[t]}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
