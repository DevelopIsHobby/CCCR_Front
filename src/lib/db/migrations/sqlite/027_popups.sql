-- 홈페이지에 들어오면 뜨는 공지 팝업.
--
-- 그림 한 장을 띄우는 방식이다. 사무국이 만든 안내 이미지를 그대로 올려 쓰고,
-- 누르면 정해 둔 곳으로 보낸다. 글로 쓰는 팝업은 만들지 않는다.
--
-- 그림은 본문 이미지와 같은 저장소(images)를 쓰고 주소만 들고 있는다.
-- 이사장 사진·회원사 로고와 같은 방식이라 파일 관리의 '안 쓰는 이미지' 판단도
-- 같은 자리(image-usage.ts)에서 함께 본다.
CREATE TABLE popups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 관리 화면에서 구분하려고 두는 이름. 화면에는 나오지 않는다.
  title      TEXT    NOT NULL,
  image_url  TEXT    NOT NULL,
  -- 그림을 눌렀을 때 갈 곳. 비우면 누를 수 없다.
  href       TEXT    NOT NULL DEFAULT '',
  -- 띄울 기간(YYYY-MM-DD). 비우면 그쪽 끝은 제한하지 않는다.
  starts_on  TEXT    NOT NULL DEFAULT '',
  ends_on    TEXT    NOT NULL DEFAULT '',
  -- 화면에 그릴 너비(px). 그림이 커도 이 폭에 맞춰 줄인다.
  width      INTEGER NOT NULL DEFAULT 420,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_popups_live ON popups(is_visible, sort_order, id);
