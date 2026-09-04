import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { search } from "@/lib/db/search";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "통합검색" };

const input =
  "w-full rounded-md border border-line bg-white px-5 py-3.5 text-md outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const { posts, pages, total } = await search(q);

  const short = q.length > 0 && q.length < 2;

  return (
    <PageShell
      href="/search"
      title="통합검색"
      category="검색"
      desc="게시판 글과 안내 화면을 한 번에 찾습니다."
    >
      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="site-q" className="sr-only">
          검색어
        </label>
        <input
          id="site-q"
          name="q"
          type="search"
          defaultValue={q}
          autoFocus
          placeholder="찾으실 낱말을 넣어 주세요"
          className={input}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-navy-900 px-8 py-3.5 text-md font-bold text-white transition-colors hover:bg-brand-600"
        >
          검색
        </button>
      </form>

      {short && (
        <p className="mt-6 rounded-lg bg-surface px-5 py-4 text-md text-ink-600">
          검색어는 두 글자 이상 넣어 주세요.
        </p>
      )}

      {q && !short && (
        <p className="mt-8 border-b-2 border-navy-900 pb-4 text-md text-ink-600">
          <b className="font-bold text-navy-900">{q}</b> 검색 결과{" "}
          <b className="label-mono font-bold tabular-nums text-brand-600">{total}</b>건
        </p>
      )}

      {q && !short && total === 0 && (
        <div className="py-11 text-center">
          <p className="text-md text-ink-600">찾으시는 내용이 없습니다.</p>
          <p className="mt-2 text-base text-ink-400">
            낱말을 줄이거나 다른 말로 바꿔서 다시 찾아보세요.
          </p>
        </div>
      )}

      {/* 안내 화면 — 몇 개 안 되므로 위에 붙여 바로 보이게 한다 */}
      {pages.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-navy-900">
            안내 화면 <span className="label-mono ml-1 tabular-nums text-ink-400">{pages.length}</span>
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {pages.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="inline-flex items-baseline gap-2 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="text-sm text-ink-400">{p.category}</span>
                  <span className="text-base font-bold text-navy-900">{p.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-navy-900">
            게시글 <span className="label-mono ml-1 tabular-nums text-ink-400">{posts.length}</span>
          </h2>

          <ul className="mt-4 border-t-2 border-navy-900">
            {posts.map((post) => (
              <li key={`${post.board}-${post.id}`} className="border-b border-line">
                <Link href={post.href} className="group block py-5">
                  <span className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex shrink-0 rounded bg-brand-50 px-2.5 py-1 text-2xs font-bold text-brand-700">
                      {post.boardName}
                    </span>
                    <span className="text-md font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                      {post.title}
                    </span>
                    <span className="label-mono ml-auto shrink-0 tabular-nums text-ink-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </span>

                  {post.snippet && (
                    <span className="mt-2 block text-base leading-relaxed text-ink-600">
                      {post.snippet}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {posts.length >= 30 && (
            <p className="mt-5 text-base text-ink-400">
              결과가 많아 최근 30건만 보여드립니다. 낱말을 더 좁혀 보세요.
            </p>
          )}
        </section>
      )}
    </PageShell>
  );
}
