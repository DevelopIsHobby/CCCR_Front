"use client";

import { passwordChecks } from "@/lib/auth/password-rule";

/*
  비밀번호를 입력하는 동안 규칙을 맞췄는지 바로 보여 준다.
  제출하고 나서야 '영문과 숫자를 함께'라는 말을 보면 다시 쳐야 해서 번거롭다.
  비어 있을 때는 회색으로 두고, 맞춘 항목만 초록으로 바꾼다.
*/
export default function PasswordRuleHint({ value }: { value: string }) {
  const c = passwordChecks(value);
  const items: [boolean, string][] = [
    [c.length, "8자 이상"],
    [c.letter, "영문 포함"],
    [c.digit, "숫자 포함"],
  ];

  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="비밀번호 규칙">
      {items.map(([ok, label]) => (
        <li key={label} className={ok ? "font-semibold text-brand-600" : "text-ink-400"}>
          <span aria-hidden>{ok ? "✓" : "·"}</span> {label}
          <span className="sr-only">{ok ? " (맞음)" : " (아직)"}</span>
        </li>
      ))}
    </ul>
  );
}
