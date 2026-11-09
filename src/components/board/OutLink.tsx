"use client";

import { recordView } from "@/lib/db/post-actions";

/*
  바깥 원문으로 바로 가는 글(사업공고·산업뉴스)의 제목 링크.

  이런 글은 사이트 안 글 화면을 거치지 않아 조회수가 늘 0이었다. 제목을 누르면
  (가운데 단추로 새 탭에 열어도) 한 번 센다. 새 창으로 열리므로 이 화면은 그대로 남아
  세는 요청이 끝까지 간다.
*/
export default function OutLink({
  postId,
  href,
  className,
  children,
}: {
  postId: number;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const count = () => void recordView(postId);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
      onClick={count}
      onAuxClick={(e) => {
        if (e.button === 1) count();
      }}
    >
      {children}
    </a>
  );
}
