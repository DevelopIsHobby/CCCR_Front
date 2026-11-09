-- 2024·2025년 연혁(사무국 '연혁 정리.pdf' 19·20쪽, 2026-11-09 사무국 확인).
--
-- 사이트 연혁은 2023년 12월에서 끝나 있었고, 관리자 연혁 관리는 이미 있는 연도만 고를 수 있어
-- 새 연도를 넣을 길이 없었다(같은 날 '새 연도 추가'를 붙였다).
-- 연혁 차례는 sort_order 하나로 정한다(작을수록 위). 있던 것을 모두 27칸 내리고 맨 위에 넣는다.
-- 같은 달은 PDF 차례를 따르되 최근 달이 위로 온다(2023년과 같은 모양).
-- PDF 비고의 기관(IITP·NIPA·NIA 등)은 내용 끝 괄호에, 장소(COEX 등)는 장소 칸에 넣었다.
-- 2025년이 이미 있으면 넘어간다(두 번 돌아도 안전해야 한다. 035 주석 참고).
UPDATE history_entries SET sort_order = sort_order + 27 WHERE NOT EXISTS (SELECT 1 FROM history_entries WHERE year = '2025년');
INSERT INTO history_entries (year, month, title, place, sort_order)
SELECT v.year, v.month, v.title, v.place, v.sort_order FROM (
  SELECT '2025년' AS year, '12' AS month, '‘2025 디지털 사회혁신 서비스 개발, 아이디어 공모전’ 시상식 및 성과공유회 개최' AS title, '엘타워' AS place, 1 AS sort_order
  UNION ALL SELECT '2025년' AS year, '12' AS month, '‘2025 개방형 클라우드 플랫폼(K-PaaS) 활용전 공모전’ 시상식 참여' AS title, 'COEX' AS place, 2 AS sort_order
  UNION ALL SELECT '2025년' AS year, '12' AS month, 'CCCR Insight Series 2025 세미나 개최' AS title, '한국과학기술회관' AS place, 3 AS sort_order
  UNION ALL SELECT '2025년' AS year, '10' AS month, '청년취업사관학교 새싹(SeSAC) 3기 동대문캠퍼스 교육 시작(서울경제진흥원)' AS title, '' AS place, 4 AS sort_order
  UNION ALL SELECT '2025년' AS year, '09' AS month, '채용연계형 SW전문인재양성사업 4기 프로젝트 발표회 및 수료식 개최' AS title, '구로교육장' AS place, 5 AS sort_order
  UNION ALL SELECT '2025년' AS year, '09' AS month, 'IITP 우수성과 공유 컨퍼런스 참석' AS title, 'COEX' AS place, 6 AS sort_order
  UNION ALL SELECT '2025년' AS year, '08' AS month, 'AI 데이터센터 전문가 협의회 참여(TTA, KCIA)' AS title, '' AS place, 7 AS sort_order
  UNION ALL SELECT '2025년' AS year, '08' AS month, '2025 OCP(Open Compute Project) Korea Tech Day 참가(클라우드 부스 운영)' AS title, 'COEX' AS place, 8 AS sort_order
  UNION ALL SELECT '2025년' AS year, '08' AS month, '국가 위기대응 디지털 지원체계 기반 지원사업 참여(NIA)' AS title, '' AS place, 9 AS sort_order
  UNION ALL SELECT '2025년' AS year, '06' AS month, '2025 정보통신·방송 기술 개발 사업 신규 참여 : 엣지AI 학습 및 지능의 동시 제공이 가능한 시스템 SW 기술 개발(IITP)' AS title, '' AS place, 10 AS sort_order
  UNION ALL SELECT '2025년' AS year, '04' AS month, '채용연계형 SW전문인재양성사업 4기 교육 시작(IITP)' AS title, '' AS place, 11 AS sort_order
  UNION ALL SELECT '2025년' AS year, '03' AS month, '2025 정보통신·방송 기술 개발 사업 신규 참여 : AI반도체 클라우드를 위한 고속 병렬 파일시스템 기술 개발(IITP)' AS title, '' AS place, 12 AS sort_order
  UNION ALL SELECT '2025년' AS year, '03' AS month, '2025 정보통신·방송 기술 개발 사업 신규 참여 : AI반도체 컴퓨팅 자원분해 및 자원풀링 기술 개발(IITP)' AS title, '' AS place, 13 AS sort_order
  UNION ALL SELECT '2025년' AS year, '03' AS month, '제17회 정기총회 개최(사업 및 예산 승인)' AS title, '' AS place, 14 AS sort_order
  UNION ALL SELECT '2024년' AS year, '12' AS month, '‘2024 개방형 클라우드 플랫폼(K-PaaS) 기반 서비스 개발·아이디어 공모전’ 시상식 참여' AS title, '포스트타워' AS place, 15 AS sort_order
  UNION ALL SELECT '2024년' AS year, '12' AS month, 'GSMP 2024 성과보고회 개최' AS title, '베스트웨스턴 프리미어 강남' AS place, 16 AS sort_order
  UNION ALL SELECT '2024년' AS year, '11' AS month, '‘국내 SW기업의 클라우드 신시장 활로 개척 및 인적 인프라 확보를 위한 업무협약(MOU)’ 체결(대한상공회의소)' AS title, '' AS place, 17 AS sort_order
  UNION ALL SELECT '2024년' AS year, '10' AS month, '채용연계형 SW전문인재양성사업 3기 프로젝트 발표회 및 수료식 개최' AS title, 'COEX' AS place, 18 AS sort_order
  UNION ALL SELECT '2024년' AS year, '10' AS month, 'GSMP 2024 제2차·제3차 해외전시 참가' AS title, '두바이, 일본' AS place, 19 AS sort_order
  UNION ALL SELECT '2024년' AS year, '09' AS month, 'GSMP 2024 제1차 해외전시 참가' AS title, '미국' AS place, 20 AS sort_order
  UNION ALL SELECT '2024년' AS year, '09' AS month, 'CCCR TaB 2024 세미나 개최(지능형 클라우드 자원관리 기술과 공개SW)' AS title, 'COEX' AS place, 21 AS sort_order
  UNION ALL SELECT '2024년' AS year, '06' AS month, '국가 위기대응 디지털 지원체계 기반 지원사업 참여(NIA)' AS title, '' AS place, 22 AS sort_order
  UNION ALL SELECT '2024년' AS year, '06' AS month, 'GSMP 2024 개최·운영 사업 수행(NIPA)' AS title, '' AS place, 23 AS sort_order
  UNION ALL SELECT '2024년' AS year, '05' AS month, '2024 글로벌 SaaS 마켓플레이스 지원 사업 참여(NIPA)' AS title, '' AS place, 24 AS sort_order
  UNION ALL SELECT '2024년' AS year, '03' AS month, '2024 정보통신·방송 기술 개발 사업 신규 참여 : 일상생활 공간에서 자율행동체의 복합작업 성공률 향상을 위한 자율행동체 엣지 AI SW 기술 개발(IITP)' AS title, '' AS place, 25 AS sort_order
  UNION ALL SELECT '2024년' AS year, '03' AS month, '2024 정보통신·방송 기술 개발 사업 신규 참여 : 써드파티 데이터의 활용성 증대를 위한 액티브 메타데이터 기반 능동형 데이터 확장 기술 개발(IITP)' AS title, '' AS place, 26 AS sort_order
  UNION ALL SELECT '2024년' AS year, '03' AS month, '제16회 정기총회 개최(사업 및 예산 승인)' AS title, '' AS place, 27 AS sort_order
) v
WHERE NOT EXISTS (SELECT 1 FROM history_entries WHERE year = '2025년');
