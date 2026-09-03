import Link from "next/link";
/* 라우트 그룹 밖이라 전역 layout 이 없다. 스타일을 여기서 직접 들여온다. */
import "./globals.css";

/*
  없는 주소로 들어왔을 때.

  이 파일은 라우트 그룹 밖(app/)에 있어야 어느 주소에서든 잡힌다.
  그래서 헤더·푸터가 붙지 않는다. 대신 돌아갈 길을 큼직하게 놓는다.

  기본 화면은 영문이라 조합 사이트에 그대로 두면 어색하다.
*/
export default function NotFound() {
  return (
    <html lang="ko">
      <body className="grid min-h-screen place-items-center bg-white px-6 py-20">
        <main className="w-full max-w-lg text-center">
          <p className="label-mono text-6xl font-bold leading-none text-brand-200">404</p>

          <h1 className="mt-8 text-2xl font-bold leading-snug text-navy-900">
            찾으시는 화면이 없습니다
          </h1>
          <p className="mt-4 text-md leading-relaxed text-ink-600">
            주소가 바뀌었거나 지워진 화면일 수 있습니다.
            <br />
            아래에서 다시 찾아 주세요.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-navy-900 px-7 py-3.5 text-md font-bold text-white transition-colors hover:bg-brand-600"
            >
              홈으로
            </Link>
            <Link
              href="/search"
              className="rounded-full px-7 py-3.5 text-md font-bold text-navy-900 ring-1 ring-line transition-colors hover:bg-surface"
            >
              통합검색
            </Link>
          </div>

          <p className="mt-12 border-t border-line pt-6 text-base text-ink-400">
            한국클라우드컴퓨팅연구조합
          </p>
        </main>
      </body>
    </html>
  );
}
