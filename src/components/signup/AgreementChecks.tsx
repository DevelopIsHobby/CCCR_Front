"use client";

import { useState } from "react";
import LegalDialog, { type LegalTab } from "@/components/LegalDialog";
import SignupPrivacyNotice from "@/components/SignupPrivacyNotice";
import type { MemberType } from "@/lib/user-types";

/*
  가입 약관 동의.

  이메일 가입의 둘째 단계와, 소셜 로그인 단추로 바로 와서 아직 동의하지 않은 사람의
  소셜 가입 화면이 함께 쓴다. 칸 이름(agreeTerms·agreePrivacy·agreeNewsletter)은
  서버가 읽는 이름과 같아야 한다(signup-actions.ts, signup-intent.ts).

  '전체 동의'는 세 칸을 한꺼번에 켜고 끄는 편의일 뿐 따로 보내지 않는다.
  필수 둘은 required 라 켜지 않으면 다음으로 넘어가지 않는다.
*/
const ITEMS: { id: "agreeTerms" | "agreePrivacy" | "agreeNewsletter"; label: string; doc: LegalTab | null; required: boolean }[] = [
  { id: "agreeTerms", label: "이용약관 동의", doc: "terms", required: true },
  { id: "agreePrivacy", label: "개인정보 수집·이용 동의", doc: "privacy", required: true },
  { id: "agreeNewsletter", label: "뉴스레터 수신 동의", doc: null, required: false },
];

type Checked = Record<(typeof ITEMS)[number]["id"], boolean>;

export default function AgreementChecks({
  memberType,
  social = false,
}: {
  memberType?: MemberType;
  social?: boolean;
}) {
  const [checked, setChecked] = useState<Checked>({
    agreeTerms: false,
    agreePrivacy: false,
    agreeNewsletter: false,
  });
  /* 전문은 새 페이지로 나가지 않고 팝업으로 본다. 고른 것이 사라지지 않게. */
  const [doc, setDoc] = useState<LegalTab | null>(null);

  const all = ITEMS.every((t) => checked[t.id]);
  const setAll = (on: boolean) =>
    setChecked({ agreeTerms: on, agreePrivacy: on, agreeNewsletter: on });

  return (
    <>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-brand-500/30 bg-brand-50 px-5 py-4 text-md font-bold text-navy-900 has-[:checked]:border-brand-500">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => setAll(e.target.checked)}
          className="size-5 shrink-0 rounded accent-brand-600"
        />
        전체 동의
        <span className="text-sm font-medium text-ink-400">(선택 항목 포함)</span>
      </label>

      <div className="mt-3 space-y-2">
        {/* 전문보기는 라벨 밖에 둔다. 라벨 안에 있으면 눌렀을 때 동의 체크가 함께 켜진다. */}
        {ITEMS.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-2.5 text-md text-ink-700">
            <label className="flex flex-1 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name={t.id}
                required={t.required}
                checked={checked[t.id]}
                onChange={(e) => setChecked((c) => ({ ...c, [t.id]: e.target.checked }))}
                className="size-4 shrink-0 rounded border-line accent-brand-600"
              />
              <span>
                {t.label}
                <span
                  className={`ml-2 text-xs font-bold ${t.required ? "text-flame-600" : "text-ink-400"}`}
                >
                  {t.required ? "필수" : "선택"}
                </span>
              </span>
            </label>
            {t.doc && (
              <button
                type="button"
                onClick={() => setDoc(t.doc)}
                className="shrink-0 text-sm text-brand-600 underline underline-offset-2"
              >
                전문보기
              </button>
            )}
          </div>
        ))}
      </div>

      <SignupPrivacyNotice memberType={memberType} social={social} />

      <LegalDialog
        open={doc !== null}
        tab={doc ?? "terms"}
        tabs={["terms", "privacy"]}
        onTabChange={setDoc}
        onClose={() => setDoc(null)}
      />
    </>
  );
}
