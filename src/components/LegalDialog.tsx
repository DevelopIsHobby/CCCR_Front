"use client";

import { useEffect, useRef } from "react";
import { IconClose } from "./Icons";
import {
  EMAIL_POLICY_ARTICLES,
  PRIVACY_ARTICLES,
  PRIVACY_INTRO,
  type LegalArticle,
} from "@/lib/legal-data";
import { TERMS_ARTICLES } from "@/lib/terms-data";

/*
  개인정보취급방침 · 이메일무단수집거부 팝업.

  원본 사이트는 별도 브라우저 창을 띄우지만, 새 창은 팝업 차단에 막히고
  모바일에서 다루기 어렵다. 같은 두 갈래 구성을 유지하되 화면 안의 대화상자로 연다.
  <dialog> 를 써서 ESC 닫기와 초점 가두기를 브라우저에 맡긴다.
*/
export type LegalTab = "privacy" | "email" | "terms";

const TAB_LABEL: Record<LegalTab, string> = {
  terms: "이용약관",
  privacy: "개인정보수집방침",
  email: "이메일무단수집거부",
};

const ARTICLES: Record<LegalTab, LegalArticle[]> = {
  terms: TERMS_ARTICLES,
  privacy: PRIVACY_ARTICLES,
  email: EMAIL_POLICY_ARTICLES,
};

function Article({ article }: { article: LegalArticle }) {
  return (
    <section>
      {article.chapter && (
        <p className="mb-4 rounded-md bg-navy-900 px-4 py-2 text-base font-bold text-white">
          {article.chapter}
        </p>
      )}
      <h3 className="text-md font-bold text-navy-900">{article.title}</h3>

      <div className="mt-3 space-y-3">
        {article.blocks.map((block, i) =>
          "text" in block ? (
            <p key={i} className="text-base leading-[1.85] text-ink-600">
              {block.text}
            </p>
          ) : (
            <ul key={i} className="space-y-1.5 rounded-lg bg-surface px-5 py-4">
              {block.items.map((item) => {
                const text = typeof item === "string" ? item : item.text;
                const sub = typeof item === "string" ? undefined : item.sub;

                return (
                  <li key={text} className="text-base leading-relaxed text-ink-600">
                    <span className="flex gap-2.5">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-500" aria-hidden />
                      {text}
                    </span>
                    {sub && (
                      <ul className="ml-5 mt-1.5 space-y-1">
                        {sub.map((line) => (
                          <li key={line} className="flex gap-2 text-base text-ink-400">
                            <span
                              className="mt-2 size-1 shrink-0 rounded-full bg-ink-400"
                              aria-hidden
                            />
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          ),
        )}
      </div>
    </section>
  );
}

export default function LegalDialog({
  open,
  tab,
  tabs = ["privacy", "email"],
  onTabChange,
  onClose,
}: {
  open: boolean;
  tab: LegalTab;
  /** 보여줄 갈래. 푸터는 방침 두 가지, 가입 화면은 약관과 방침을 쓴다. */
  tabs?: LegalTab[];
  onTabChange: (tab: LegalTab) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /* 갈래를 바꾸면 처음부터 읽도록 위로 올린다. */
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  const articles = ARTICLES[tab];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        /* 바깥(배경)을 누르면 닫는다 */
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(920px,92vw)] rounded-xl p-0 backdrop:bg-navy-950/60 open:flex open:max-h-[86vh] open:flex-col"
      aria-label="이용안내"
    >
      <div className="flex shrink-0 border-b border-line">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            aria-pressed={tab === id}
            className={`flex-1 px-5 py-4 text-md font-bold transition-colors ${
              tab === id ? "bg-brand-600 text-white" : "bg-surface text-ink-600 hover:text-brand-600"
            }`}
          >
            {TAB_LABEL[id]}
          </button>
        ))}

        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="grid w-14 shrink-0 place-items-center bg-surface text-ink-400 transition-colors hover:bg-white hover:text-navy-900"
        >
          <IconClose className="size-5" />
        </button>
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto bg-white px-7 py-7 lg:px-9">
        {tab === "privacy" && (
          <p className="mb-7 border-b border-line pb-5 text-md font-bold leading-relaxed text-navy-900">
            {PRIVACY_INTRO}
          </p>
        )}

        <div className="space-y-7">
          {articles.map((article) => (
            <Article key={article.title} article={article} />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 justify-end border-t border-line bg-surface px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
        >
          닫기
        </button>
      </div>
    </dialog>
  );
}
