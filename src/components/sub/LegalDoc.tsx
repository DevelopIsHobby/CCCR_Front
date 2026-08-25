type Article = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

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
            <h2 className="border-b-2 border-navy-900 pb-3 text-lg font-bold text-navy-900">
              {a.title}
            </h2>

            <div className="mt-5 space-y-4">
              {a.paragraphs.map((p, i) => (
                <p key={i} className="text-md leading-[1.85] text-ink-600">
                  {p}
                </p>
              ))}
            </div>

            {a.list && (
              <ul className="mt-5 space-y-2.5 rounded-lg bg-surface px-6 py-5">
                {a.list.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-md leading-relaxed text-ink-600"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="label-mono mt-14 border-t border-line pt-6 text-ink-400">
        시행일자 · 2026-01-01
      </p>
    </div>
  );
}
