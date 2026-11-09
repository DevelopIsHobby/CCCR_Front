/*
  게시판 목록이 함께 쓰는 표시 — 새 글 딱지와 조회수.

  전에는 표 방식 목록(공지·기술동향·자료실)에만 작은 'new' 글자가 있었고, 행사·사업공고·
  산업뉴스·포토갤러리 목록에는 새 글 표시도 조회수도 없었다(2026-11-09 사무국).
  모든 목록이 같은 딱지·같은 기준(등록 7일 이내)을 쓰도록 여기 모은다.
*/

/** 등록 7일 이내면 새 글이다. createdAt 은 UTC 'YYYY-MM-DD HH:MM:SS' */
export function isNewPost(createdAt: string): boolean {
  return Date.now() - new Date(`${createdAt.replace(" ", "T")}Z`).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function NewBadge({ createdAt }: { createdAt: string }) {
  if (!isNewPost(createdAt)) return null;
  return (
    <span className="inline-flex shrink-0 items-center rounded bg-flame-500 px-1.5 py-0.5 text-2xs font-bold leading-none tracking-wide text-white">
      NEW
    </span>
  );
}

/** '조회 12'. 숫자는 고정폭으로 맞춘다 */
export function ViewCount({ views, className = "" }: { views: number; className?: string }) {
  return (
    <span className={`label-mono shrink-0 tabular-nums text-ink-400 ${className}`}>
      조회 {views.toLocaleString("ko-KR")}
    </span>
  );
}
