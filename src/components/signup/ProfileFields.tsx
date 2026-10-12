import type { ReactNode } from "react";
import { SIGNUP_MAX } from "@/lib/auth/signup-limits";
import type { MemberType } from "@/lib/user-types";

/*
  회원 유형별 입력칸.

  서버가 받는 칸과 같아야 한다(lib/auth/signup-profile.ts).
    개인 — 이름 · 소속(선택) · 이메일 · 휴대전화번호
    기업 — 기관·회사명 · 담당자 이름 · 부서·직위(선택) · 이메일 · 휴대전화번호 · 사업자등록번호(선택)

  이메일 칸은 두 가입 경로가 다르게 받으므로(소셜은 서비스가 확인해 준 주소를 잠가 둔다)
  자리만 두고 부르는 쪽이 넣는다.
*/
export const fieldInput =
  "w-full rounded-md border border-line px-4 py-3.5 text-md outline-none transition-colors focus:border-brand-500";

type Field = {
  id: "company" | "name" | "department" | "phone" | "bizNumber";
  label: string;
  required: boolean;
  type?: string;
  ac: string;
  full?: boolean;
  hint?: string;
};

const PHONE: Field = {
  id: "phone",
  label: "휴대전화번호",
  required: true,
  type: "tel",
  ac: "tel",
  hint: "예: 010-1234-5678",
};

const FIELDS: Record<MemberType, Field[]> = {
  개인: [
    { id: "name", label: "이름", required: true, ac: "name" },
    { id: "company", label: "소속", required: false, ac: "organization", hint: "학교·회사 등" },
  ],
  기업: [
    { id: "company", label: "기관·회사명", required: true, ac: "organization", full: true },
    { id: "name", label: "담당자 이름", required: true, ac: "name" },
    { id: "department", label: "부서·직위", required: false, ac: "organization-title" },
  ],
};

/* 이메일·휴대전화 다음에 오는 칸 */
const AFTER_CONTACT: Record<MemberType, Field[]> = {
  개인: [],
  기업: [
    { id: "bizNumber", label: "사업자등록번호", required: false, ac: "off", hint: "예: 123-45-67890" },
  ],
};

function Input({ f, idPrefix, defaultValue }: { f: Field; idPrefix: string; defaultValue?: string }) {
  return (
    <div className={f.full ? "sm:col-span-2" : ""}>
      <label htmlFor={`${idPrefix}-${f.id}`} className="mb-2 block text-base font-bold text-navy-900">
        {f.label}
        {!f.required && <span className="ml-1.5 text-xs font-medium text-ink-400">선택</span>}
      </label>
      <input
        id={`${idPrefix}-${f.id}`}
        name={f.id}
        type={f.type ?? "text"}
        autoComplete={f.ac}
        required={f.required}
        maxLength={SIGNUP_MAX[f.id]}
        placeholder={f.hint}
        defaultValue={defaultValue}
        className={fieldInput}
      />
    </div>
  );
}

export default function ProfileFields({
  memberType,
  idPrefix,
  email,
  defaults = {},
}: {
  memberType: MemberType;
  /** 칸 id 앞머리. 예) 'signup' → #signup-name */
  idPrefix: string;
  /** 이메일 칸. 부르는 쪽이 만든다 */
  email: ReactNode;
  defaults?: Partial<Record<Field["id"], string>>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {FIELDS[memberType].map((f) => (
        <Input key={f.id} f={f} idPrefix={idPrefix} defaultValue={defaults[f.id]} />
      ))}
      {email}
      <Input f={PHONE} idPrefix={idPrefix} defaultValue={defaults.phone} />
      {AFTER_CONTACT[memberType].map((f) => (
        <Input key={f.id} f={f} idPrefix={idPrefix} defaultValue={defaults[f.id]} />
      ))}
    </div>
  );
}
