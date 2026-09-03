-- 신청을 넣은 사람이 누구인지 기록한다.
--
-- 지금까지는 신청서에 적은 이메일로만 신청을 찾았다. 그런데 로그인 계정 주소와
-- 연락받을 주소가 다른 경우가 흔하다. 회사 대표 주소로 받고 싶다거나,
-- 담당자가 바뀌어 다른 주소를 적는 식이다. 그러면 마이페이지에 자기 신청이
-- 안 보인다.
--
-- 로그인한 채로 넣었으면 user_id 를 남긴다. 마이페이지는 user_id 가 나이거나
-- 이메일이 내 계정 주소인 신청을 모두 보여 준다. 로그인 없이 넣은 신청은
-- user_id 가 없고 전과 같이 이메일과 접수번호로 찾는다.

ALTER TABLE notice_subscribers  ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE education_proposals ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE room_reservations   ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE promo_requests      ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_notice_subscribers_user  ON notice_subscribers(user_id);
CREATE INDEX idx_education_proposals_user ON education_proposals(user_id);
CREATE INDEX idx_room_reservations_user   ON room_reservations(user_id);
CREATE INDEX idx_promo_requests_user      ON promo_requests(user_id);
