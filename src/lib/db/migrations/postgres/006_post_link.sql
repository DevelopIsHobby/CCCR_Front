-- 게시글에 함께 보여줄 링크. 본문 안의 하이퍼링크와 달리 별도 칸으로 표시한다.
-- (예: 기사 원문, 신청 페이지)
ALTER TABLE posts ADD COLUMN link_url TEXT;
ALTER TABLE posts ADD COLUMN link_label TEXT;
