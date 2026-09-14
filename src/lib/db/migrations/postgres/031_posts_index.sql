-- sqlite/031_posts_index.sql 과 같은 내용에, 제목·본문 검색 색인을 더한다.

-- 게시글 목록 색인을 조회 모양에 맞춘다. 설명은 sqlite 쪽 파일에 적어 두었다.
DROP INDEX IF EXISTS idx_posts_board;
CREATE INDEX IF NOT EXISTS idx_posts_list ON posts(deleted_at, board, id);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(deleted_at, board, is_pinned, id);

-- 통합검색과 게시판 제목 검색은 LIKE '%말%' 이다.
-- 앞에 와일드카드가 붙으면 보통 색인을 쓸 수 없어 글을 통째로 훑는다.
-- pg_trgm 은 글자 세 개씩 쪼개 색인하므로 이런 검색에도 쓸 수 있다.
--
-- 확장을 켤 권한이 없는 곳도 있으므로 실패해도 마이그레이션을 멈추지 않는다.
-- DO 블록 안의 EXCEPTION 은 그 블록만 되돌리고 바깥 트랜잭션은 그대로 둔다.
-- 색인이 없어도 검색은 지금처럼 동작한다. 느릴 뿐이다.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_trgm 을 켤 수 없어 검색 색인은 건너뜁니다: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_posts_body_trgm  ON posts USING gin (body  gin_trgm_ops);
  END IF;
END $$;
