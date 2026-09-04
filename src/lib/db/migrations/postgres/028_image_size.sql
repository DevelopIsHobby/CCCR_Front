-- sqlite/028_image_size.sql 과 같은 내용
-- 올린 그림의 가로·세로.
--
-- 브라우저가 그림 크기를 미리 모르면 자리를 못 잡아, 그림이 뜰 때마다 아래
-- 내용이 밀린다. 뉴스레터처럼 큰 그림을 세로로 늘어놓는 화면에서 특히 심하다.
--
-- 0 은 '읽지 못했다'는 뜻이다. 형식이 낯설거나 파일이 망가진 경우인데, 그때는
-- 종전처럼 자리를 잡지 않고 그린다. 올리기를 막지는 않는다.
-- 이미 올라와 있는 그림도 0 으로 남는다. 다시 올리면 채워진다.
ALTER TABLE images ADD COLUMN width  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE images ADD COLUMN height INTEGER NOT NULL DEFAULT 0;
