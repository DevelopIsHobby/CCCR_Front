-- sqlite/018_notice_and_proposals.sql 과 같은 내용
-- 사업공고 수신 신청.
-- 임원사 담당자가 신청하면 사무국이 명단을 내려받아 매주 공고를 보낸다.
-- 뉴스레터와 받는 사람도 보내는 내용도 달라 표를 따로 둔다.
CREATE TABLE notice_subscribers (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company    TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  tel        TEXT    NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_notice_subscribers_status ON notice_subscribers(status, id);

-- 교육사업을 함께 하자는 제안.
-- 바깥에서 아무나 넣을 수 있는 창구라 상태를 두고 사무국이 처리한다.
CREATE TABLE education_proposals (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org        TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  tel        TEXT    NOT NULL DEFAULT '',
  subject    TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reading', 'done')),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_education_proposals_status ON education_proposals(status, id);
