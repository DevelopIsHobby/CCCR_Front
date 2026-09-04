-- sqlite/026_sns_links.sql 과 같은 내용
-- 조합 SNS 주소.
--
-- 코드에 박아 두면 계정이 바뀔 때마다 배포해야 한다. 사이트 정보와 같은 자리에
-- 두어 사무국이 관리자 화면에서 고치게 한다. 값이 비어 있으면 그 아이콘은
-- 화면에 나오지 않는다.
INSERT INTO site_settings (key, value, updated_at) VALUES
  ('snsLinkedin',  'https://www.linkedin.com/company/consortiumofcloudcomputingresearch/', '2026-09-04 00:00:00'),
  ('snsInstagram', 'https://www.instagram.com/cccr_academy/', '2026-09-04 00:00:00'),
  ('snsFacebook',  'https://www.facebook.com/cccrpage/', '2026-09-04 00:00:00');
