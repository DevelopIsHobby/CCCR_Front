import Link from "next/link";
import { IconArrow } from "./Icons";
import { listRecentByBoard } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

/*
  메인 '포토갤러리' 띠(연회색). 최근 행사 사진 네 건을 첫 사진 카드로 늘어놓는다.

  메인 띠 색은 흰색과 연회색을 번갈아 둔다(EduSection.tsx 주석). 이 띠는
  흰 '주요 정책' 띠와 남색 '참여하기' 띠 사이라 연회색을 쓴다.
  주요 정책 띠가 비어 접히면 바로 위가 같은 연회색 아카데미 띠가 되므로 가는 선으로 가른다.
  사진 글이 하나도 없으면 띠를 통째로 접는다.
*/
export default async function GallerySection() {
  const posts = (await listRecentByBoard(["gallery"], 4)).filter((p) => !p.isLocked);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-line bg-surface py-12 lg:py-14" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-500">조합 활동 · 행사 현장</p>
            <h2 id="gallery-heading" className="mt-3 text-2xl font-bold text-navy-900 lg:text-3xl">
              포토갤러리
            </h2>
          </div>
          <Link
            href="/board/gallery"
            className="group inline-flex items-center gap-2 text-base font-semibold text-brand-600 hover:text-navy-900"
          >
            사진 더 보기
            <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/board/gallery/${post.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_32px_-18px_rgba(6,42,85,0.35)]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-surface">
                  {post.thumbUrl ? (
                    /* 크기가 제각각인 사진이라 next/image 대신 img 를 쓴다(PhotoGallery.tsx) */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbUrl}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm text-ink-400">
                      사진 없음
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
                  <p className="line-clamp-2 text-md font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                    {post.title}
                  </p>
                  <p className="label-mono mt-auto tabular-nums text-ink-400">{formatDate(post.createdAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
