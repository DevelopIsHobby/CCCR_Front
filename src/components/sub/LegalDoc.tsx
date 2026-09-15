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

/* 바로가기로 내려갔을 때 조항 제목이 상단 헤더(72·80px)에 가리지 않게 */
const articleId = (i: number) => `article-${i + 1}`;

/** 조항이 이만큼은 되어야 목차를 둔다. 한두 조짜리 문서는 목차가 오히려 거슬린다. */
const TOC_MIN = 3;

/*
  조항 바로가기. 약관은 스무 조가 넘어 원하는 조항까지 한참 내려야 했다.
  장이 있는 문서(이용약관)는 장 이름 아래로 조항을 묶는다. 링크만 있어 서버에서 그대로 그린다.
*/
function LegalToc({ articles }: { articles: Article[] }) {
  const groups: { chapter?: string; items: { id: string; title: string }[] }[] = [];
  articles.forEach((a, i) => {
    const chapter = "chapter" in a ? a.chapter : undefined;
    if (chapter || groups.length === 0) groups.push({ chapter, items: [] });
    groups[groups.length - 1].items.push({ id: articleId(i), title: a.title });
  });

  return (
    <nav aria-label="조항 바로가기" className="mb-12 rounded-xl border border-line bg-surface px-5 py-5 sm:px-6">
      <p className="text-md font-bold text-navy-900">조항 바로가기</p>
      <div className="mt-4 space-y-4">
        {groups.map((g, gi) => (
          <div key={g.chapter ?? gi}>
            {g.chapter && <p className="mb-2 text-sm font-bold text-brand-600">{g.chapter}</p>}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {g.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm leading-snug text-ink-600 transition-colors hover:text-brand-600 hover:underline"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function LegalDoc({ articles, notice }: { articles: Article[]; notice?: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      {notice && (
        <p className="mb-12 rounded-lg border-l-4 border-flame-500 bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
          {notice}
        </p>
      )}

      {articles.length >= TOC_MIN && <LegalToc articles={articles} />}

      <div className="space-y-12">
        {articles.map((a, i) => (
          <section key={a.title} id={articleId(i)} className="scroll-mt-24 lg:scroll-mt-28">
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

      <p className="label-mono mt-11 border-t border-line pt-6 text-ink-400">
        시행일자 · 2026-01-01
      </p>
    </div>
  );
}
