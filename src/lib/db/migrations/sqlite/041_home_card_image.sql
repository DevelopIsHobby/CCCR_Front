-- 메인 히어로 슬라이드에 홍보 그림을 붙인다.
--
-- 행사 포스터처럼 이미 글자가 들어간 그림을 그대로 걸고 싶다는 요청이었다.
-- 그림이 있는 슬라이드는 그림만 보여 주고(분류·제목·본문 글자는 감춘다), 제목은 그림 설명으로 쓴다.
-- 주소는 본문 그림과 같은 저장소(/api/images/N)다. 빈 값이면 지금처럼 글자 슬라이드다.
ALTER TABLE home_cards ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
