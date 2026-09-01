import type { LegalArticle } from "@/lib/legal-data";

/* 기존 약관 페이지가 쓰는 형태와 원문 블록 형태를 함께 받는다. */
type Article =
  | { title: string; paragraphs: string[]; list?: string[] }
  | LegalArticle;

const toBlocks = (a: Article) =>
  "blocks" in a
    ? a.blocks
    : [
        ...a.paragraphs.map((text) => ({ text })),
        ...(a.list ? [{ items: a.list }] : []),
      ];

export function LegalDoc({ articles, notice }: { articles: Article[]; notice?: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      {notice && (
        <p className="mb-12 rounded-lg border-l-4 border-flame-500 bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
          {notice}
        </p>
      )}

      <div className="space-y-12">
        {articles.map((a) => (
          <section key={a.title}>
            {"chapter" in a && a.chapter && (
              <p className="mb-6 rounded-lg bg-navy-900 px-5 py-3 text-md font-bold text-white">
                {a.chapter}
              </p>
            )}
            <h2 className="border-b-2 border-navy-900 pb-3 text-lg font-bold text-navy-900">
              {a.title}
            </h2>

            <div className="mt-5 space-y-4">
              {toBlocks(a).map((block, i) =>
                "text" in block ? (
                  <p key={i} className="text-md leading-[1.85] text-ink-600">
                    {block.text}
                  </p>
                ) : (
                  <ul key={i} className="space-y-2.5 rounded-lg bg-surface px-6 py-5">
                    {block.items.map((item) => {
                      const text = typeof item === "string" ? item : item.text;
                      const sub = typeof item === "string" ? undefined : item.sub;

                      return (
                        <li key={text} className="text-md leading-relaxed text-ink-600">
                          <span className="flex gap-3">
                            <span
                              className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                              aria-hidden
                            />
                            {text}
                          </span>
                          {sub && (
                            <ul className="ml-6 mt-2 space-y-1.5">
                              {sub.map((line) => (
                                <li key={line} className="flex gap-2.5 text-base text-ink-600">
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
        ))}
      </div>

      <p className="label-mono mt-14 border-t border-line pt-6 text-ink-400">
        시행일자 · 2026-01-01
      </p>
    </div>
  );
}
