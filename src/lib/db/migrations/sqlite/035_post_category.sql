-- 게시글 분류.
--
-- 산업뉴스를 클라우드·데이터센터·AI·통신·양자·자율주행·로봇으로 나눠 올리기 위한 칸이다.
-- 어느 게시판이 어떤 분류를 쓰는지는 코드(src/lib/boards.ts 의 categories)가 정하고,
-- DB 는 글자만 담는다. 분류를 쓰지 않는 게시판과 옛 글은 빈 값이며 '전체'에서만 보인다.
ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT '';

-- 분류 탭으로 목록을 거를 때 쓴다.
CREATE INDEX idx_posts_board_category ON posts(board, category, id DESC);
