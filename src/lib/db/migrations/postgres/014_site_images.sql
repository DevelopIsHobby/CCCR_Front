-- sqlite/014_site_images.sql 과 같은 내용
-- 회원사 로고와 이사장 사진, 지도 좌표를 담을 자리.
-- 이미지는 본문 이미지와 같은 images 표에 올리고 주소(/api/images/N)만 적어 둔다.
ALTER TABLE companies ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';

-- 사무실 지도 좌표. 카카오맵 키와 함께 있어야 지도가 나온다.
ALTER TABLE offices ADD COLUMN map_lat TEXT NOT NULL DEFAULT '';
ALTER TABLE offices ADD COLUMN map_lng TEXT NOT NULL DEFAULT '';

-- 카카오 지도 JavaScript 키. 사무국이 발급받아 관리자 화면에 넣는다.
INSERT INTO site_settings (key, value, updated_at) VALUES
  ('kakaoMapKey', '', '2026-09-01 00:00:00');

-- 인사말의 이사장 사진
INSERT INTO page_texts (key, value, updated_at) VALUES
  ('greeting.photo', '', '2026-09-01 00:00:00');
