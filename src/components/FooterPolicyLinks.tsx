"use client";

import { useState } from "react";
import Link from "next/link";
import LegalDialog, { type LegalTab } from "./LegalDialog";

/*
  푸터 하단 정책 링크.
  개인정보처리방침·이메일무단수집거부는 원본 사이트처럼 팝업으로 띄우고,
  이용약관은 기존 페이지로 이동한다.
*/
export default function FooterPolicyLinks() {
  const [tab, setTab] = useState<LegalTab | null>(null);

  const linkClass = "text-sm transition-colors hover:text-flame-500";

  return (
    <>
      <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <li>
          <button
            type="button"
            onClick={() => setTab("privacy")}
            className={`${linkClass} font-bold text-white`}
          >
            개인정보처리방침
          </button>
        </li>
        <li>
          <Link href="/terms" className={linkClass}>
            이용약관
          </Link>
        </li>
        <li>
          <button type="button" onClick={() => setTab("email")} className={linkClass}>
            이메일무단수집거부
          </button>
        </li>
      </ul>

      <LegalDialog
        open={tab !== null}
        tab={tab ?? "privacy"}
        onTabChange={setTab}
        onClose={() => setTab(null)}
      />
    </>
  );
}
