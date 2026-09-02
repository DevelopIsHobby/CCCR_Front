-- 홍보 서비스 신청.
-- 조합이 가진 명단으로 회원사·기관의 제품·서비스·교육·행사를 알려 준다.
--
-- 홍보 그림은 본문 이미지와 같은 저장소(images)를 쓰고 id 만 들고 있는다.
-- 첨부파일은 게시글 첨부(attachments)가 글에 매여 있어 쓸 수 없으므로 여기에 직접 담는다.
CREATE TABLE promo_requests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  org            TEXT    NOT NULL,
  name           TEXT    NOT NULL,
  position       TEXT    NOT NULL DEFAULT '',
  email          TEXT    NOT NULL,
  tel            TEXT    NOT NULL DEFAULT '',
  subject        TEXT    NOT NULL,
  body           TEXT    NOT NULL,
  -- 배너·메일에 그대로 실을 짧은 문구. 없으면 사무국이 정한다.
  tagline        TEXT    NOT NULL DEFAULT '',
  start_on       TEXT    NOT NULL,
  -- once · weekly · biweekly · monthly
  cadence        TEXT    NOT NULL DEFAULT 'once',
  image_id       INTEGER REFERENCES images(id) ON DELETE SET NULL,
  file_name      TEXT    NOT NULL DEFAULT '',
  file_stored    TEXT    NOT NULL DEFAULT '',
  file_bytes     INTEGER NOT NULL DEFAULT 0,
  file_mime      TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new', 'reading', 'running', 'done')),
  created_at     TEXT    NOT NULL,
  updated_at     TEXT    NOT NULL
);
CREATE INDEX idx_promo_requests_status ON promo_requests(status, id);
