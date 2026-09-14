-- 게시글 목록 색인을 조회 모양에 맞춘다.
--
-- 옛 색인은 (board, is_pinned, created_at, id) 로 시작했는데, 실제 조회는
-- 언제나 deleted_at = '' 로 거르고 id 로 줄을 세운다. 앞머리가 어긋나면
-- 게시판을 좁힌 뒤 나머지를 하나씩 들춰 봐야 한다.
-- 지금은 글이 몇 건이라 티가 안 나지만, 옛 글(공지 800건대·산업뉴스 11,000건대)을
-- 옮기면 목록 한 장을 여는 값이 달라진다.
--
-- 방향(ASC/DESC)은 적지 않는다. 두 엔진 모두 색인을 거꾸로도 훑을 수 있어
-- id DESC 목록과 id ASC 이전글 찾기가 같은 색인을 쓴다.
DROP INDEX IF EXISTS idx_posts_board;

-- 목록·건수·이전글/다음글
CREATE INDEX IF NOT EXISTS idx_posts_list ON posts(deleted_at, board, id);

-- 목록 위에 붙는 고정 공지. 게시판당 몇 건뿐이라 따로 둔다.
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(deleted_at, board, is_pinned, id);
