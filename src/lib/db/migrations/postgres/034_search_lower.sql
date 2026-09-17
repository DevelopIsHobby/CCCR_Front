-- 검색을 대소문자 가리지 않게 바꾼 것에 맞춰 색인을 다시 만든다.
--
-- 조회문이 `LOWER(title) LIKE ?` 로 바뀌었다(lib/like.ts). 031 에서 만든 색인은
-- title·body 원본에 걸려 있어 LOWER() 를 씌우면 타지 않는다. 같은 자리를
-- LOWER() 기준으로 다시 만들어야 검색이 색인을 쓴다.
DROP INDEX IF EXISTS idx_posts_title_trgm;
DROP INDEX IF EXISTS idx_posts_body_trgm;

-- 확장을 켤 권한이 없는 곳도 있으므로 실패해도 마이그레이션을 멈추지 않는다.
-- 색인이 없어도 검색은 동작한다. 느릴 뿐이다.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS idx_posts_title_lower_trgm
      ON posts USING gin (LOWER(title) gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_posts_body_lower_trgm
      ON posts USING gin (LOWER(body) gin_trgm_ops);
  END IF;
END $$;
