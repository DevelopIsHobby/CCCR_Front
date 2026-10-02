-- sqlite/035_post_category.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_posts_board_category ON posts(board, category, id DESC);
