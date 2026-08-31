/**
 * 서브페이지 콘텐츠.
 * 조합 실제 자료를 받는 대로 이 파일의 값을 교체하면 화면은 그대로 동작한다.
 */

/* ── 조합소개 ─────────────────────────────────────── */

export const PURPOSES = [
  {
    title: "공동 연구개발 추진",
    desc: "회원사가 개별적으로 감당하기 어려운 클라우드 핵심기술을 공동으로 기획하고 국가 연구개발사업과 연계해 추진합니다.",
  },
  {
    title: "산업 표준화 대응",
    desc: "클라우드 인프라·플랫폼·서비스 계층의 표준화 논의에 참여하고 국내 기업의 의견을 정책에 반영합니다.",
  },
  {
    title: "전문인력 양성",
    desc: "클라우드·AI 인프라 실무 교육과정을 운영해 회원사가 필요로 하는 기술인력을 지속적으로 공급합니다.",
  },
  {
    title: "정책 건의 및 협력",
    desc: "정부·유관기관과 협력해 클라우드컴퓨팅 발전법 등 제도 개선 과제를 발굴하고 건의합니다.",
  },
];

export type HistoryEvent = { title: string; place: string };
export type HistoryMonth = { month: string; events: HistoryEvent[] };
export type HistoryYear = { year: string; months: HistoryMonth[] };

/* 조합 제공 자료 기준. 연도별로 항목을 추가하면 탭이 자동으로 늘어난다. */
export const HISTORY: HistoryYear[] = [
  {
    year: "2023년",
    months: [
      {
        month: "12",
        events: [
          { title: "제 7회 GEdge Platform 커뮤니티 컨퍼런스 개최", place: "동의대학교(부산)" },
          { title: "빅데이터 분석 및 AI 처리를 위한 클라우드向 차세대 DBMS 기술 개발 과제 성과발표회 개최", place: "벡스코 1층 컨벤션홀(부산)" },
          { title: "2023년 제3차 이사회 개최", place: "파르나스 호텔(서울)" },
          { title: "클라우드컴퓨팅 전문인력양성기관 지원사업 1차 부트캠프 개설", place: "인하대학교" },
          { title: "클라우드컴퓨팅 전문인력양성기관 지원사업 2차 부트캠프 개설", place: "온라인(단국대학교)" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2023 ICT 기기산업 페스티벌 전시부스 참가(조합 부스)", place: "코엑스 그랜드볼룸(서울)" },
          { title: "청년취업사관학교 새싹(SeSAC) 동대문캠퍼스 1기 “AWS와 함께하는 클라우드 아키텍트 과정” 개설", place: "-" },
          { title: "기업멤버십SW캠프 실무협의회 워크샵 개최", place: "벨포레리조트(증평)" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "CCCR TaB 2023 세미나 개최(Cloud key technology and service)", place: "코엑스 컨퍼런스룸(서울)" },
          { title: "CCCR 아카데미 수료생 커뮤니티 제2차 운영위원회 개최", place: "CCCR 대치" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "‘CLOUD EXPO KOREA 2023’ 전시회 참여(회원사 부스, 조합 부스)", place: "벡스코 제1전시장(부산)" },
          { title: "캠퍼스SW아카데미 “TABA 4기’ 개설", place: "단국대학교(죽전)" },
          { title: "청년취업사관학교 새싹(SeSAC) 동대문캠퍼스 1기 교육파트너 선정", place: "-" },
          { title: "CCCR 아카데미 수료생 커뮤니티 제1차 운영위원회 개최", place: "CCCR 대치" },
        ],
      },
      {
        month: "08",
        events: [{ title: "교육분과위원회 개최", place: "과학기술컨벤션센터(서울)" }],
      },
      {
        month: "07",
        events: [
          { title: "제 6회 GEdge Platform 커뮤니티 컨퍼런스 개최", place: "온라인" },
          { title: "기업멤버십SW캠프 “DevOps&SRE 엔지니어 부트캠프” 개설", place: "CCCR 성수 교육장" },
          { title: "미래내일 일경험 사업(인턴형, 프로젝트형) 오리엔테이션 개최", place: "CCCR 구로" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "5G MEC 기반 제조 특화 통신 및 SW시스템 기술 개발 과제 총괄 워크샵 개최(IITP)", place: "라마다 호텔(제주)" },
          { title: "비대면 원격근무 환경을 고려한 워케이션 서비스 기술 개발 과제 기술 성과교류회 개최", place: "과학기술컨벤션센터(서울)" },
          { title: "기업멤버십SW캠프 수행기관 간담회 개최", place: "과학기술정보통신부(세종)" },
          { title: "클라우드컴퓨팅 전문인력양성기관 지원 사업 선정(과학기술정보통신부)", place: "-" },
          { title: "캠퍼스SW아카데미 “TABA 3기” 개설", place: "단국대학교(죽전)" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "민관협력 디지털 사회 혁신 지원체계 구축운영 사업 용역 수주(NIA)", place: "-" },
          { title: "하이브리드 클라우드 환경에서 고부하 복합 머신러닝 워크로드의 수행 효율 극대화를 위한 고집적 연산자원 배치 최적화 기술 개발 과제 워크샵 개최", place: "유니 호텔(제주)" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2023 World IT Show 전시 참여 : 비대면 원격근무 환경을 고려한 워케이션 서비스 기술 개발 과제 부스", place: "코엑스 전시장 A홀(서울)" },
          { title: "이동형 맞춤 의료서비스 지원을 위한 유연의료 5G 엣지 컴퓨팅 SW 개발 과제 총괄 워크샵 개최", place: "코모도 호텔(부산)" },
          { title: "기업멤버십SW캠프 “DevOps&SRE 엔지니어 부트캠프, MLOps 플랫폼 전문인력 부트캠프” 개설", place: "CCCR 구로" },
          { title: "미래내일 일경험 사업 선정(인턴형, 프로젝트형)", place: "-" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제 5대 이사장 이동기 SK텔레콤 본부장 선임", place: "-" },
          { title: "제 15차 정기총회 개최", place: "엘타워(서울 양재)" },
          { title: "기업멤버십SW캠프 1기 발표회 및 수료식 개최", place: "코엑스(서울)" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "응용서비스 운영 지능화를 지원하는 마이크로서비스 개발‧운영 플랫폼 기술 개발 과제 워크샵 개최", place: "소노펠리체(홍천)" },
          { title: "캠퍼스SW아카데미 “TABA 2기” 개설", place: "단국대학교(죽전)" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "5G 융합서비스 공공부문 선도적용(물류) 과제 성과 확산을 위한 워크샵 개최", place: "코트야드매리어트(서울 영등포)" },
          { title: "Technology and Business Issue Report 2022 통합 버전 발간", place: "" },
        ],
      },
    ],
  },
  {
    year: "2022년",
    months: [
      {
        month: "12",
        events: [
          { title: "GEdge Platform 제5회 컨퍼런스 개최", place: "제주" },
          { title: "NIA 개방형 클라우드 플랫폼 기반 서비스 개발 이이디어 공모전 후원", place: "-" },
          { title: "NIA 디지털 기반 위기대응 아이디어 공모전 후원", place: "-" },
          { title: "사무국 소재지 이전(강남구 삼성로 86길 11)", place: "삼성" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "TaB 2022(멀티 클라우드, 엣지클라우드 등) 세미나 개최", place: "COEX" },
          { title: "‘ICT기기산업페스티벌’전시부스(CCCR R&D홍보관) 참여", place: "COEX" },
          { title: "기업멤버십 SW캠프 교육생 간담회 개최", place: "CCCR 구로" },
          { title: "기업멤버십 SW캠프 워크샵 개최 및 2023년도 협의회 회장사(CCCR) 선출", place: "제주" },
          { title: "워케이션 서비스 기술 개발 과제 진도점검 및 총괄 워크샵 개최", place: "엘타워" },
          { title: "MEC 5G 특화망 사업 총괄 워크샵 개최", place: "밀레니엄힐튼 서울" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "5G 융합서비스 공공부문 선도적용(물류 분야)의 MEC구축업체 선정 및 협약", place: "-" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "차세대 DBMS 기술 개발사업 2022년 총괄 워크샵 및 3차 운영위원회 개최", place: "부산" },
          { title: "기업멤버십 SW캠프 “MLOps 플랫폼 전문인력 과정”개설", place: "CCCR 구로" },
          { title: "GEdge Platform 제4회 컨퍼런스 개최", place: "온라인" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "캠퍼스SW 아카데미 “티맥스 아카데미”오리엔테이션 개최", place: "단국대학교" },
          { title: "교육분과 위원회 개최", place: "CCCR 역삼" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "기업멤버십 SW캠프 “DevOps & SRE 엔지니어 과정”개설", place: "CCCR 구로" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "과학기술정보통신부 “캠퍼스SW아카데미”사업 선정", place: "-" },
          { title: "과학기술정보통신부 “기업멤버십SW캠프”사업 선정", place: "-" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2022 정보통신·방송 연구개발 사업 신규 참여(4개 사업)", place: "-" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "임시 교육분과 위원회 개최", place: "온라인" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "과학기술정보통신부 “SW전문인력양성기관” 지정", place: "-" },
        ],
      },
    ],
  },
  {
    year: "2021년",
    months: [
      {
        month: "12",
        events: [
          { title: "2021 클라우드컴퓨팅 전문인력 양성기관 지원사업 선정", place: "NIPA" },
          { title: "제2회 CCCR TaB 2021(차세대 DB 기술 동향과 전망) 세미나 개최", place: "온라인" },
          { title: "GEdge Platform 제3회 컨퍼런스 개최", place: "온라인" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "혁신성장 청년인재 집중양성사업 발표회 및 수료식 개최", place: "COEX" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "제1회 CCCR TaB 2021(Future of Cloud Computing) 세미나 개최", place: "온라인" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "GEdge Platform 제2회 컨퍼런스 개최", place: "온라인" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2021 정보통신·방송 기술 개발 사업 신규 참여", place: "IITP" },
          { title: "2021 지식서비스 산업 핵심 기술 개발 사업 신규 참여", place: "KEIT" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "SW전문인력양성기관 지정", place: "과학기술정보통신부" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "제13회 정기총회 개최(사업 및 예산 승인)", place: "CCCR" },
        ],
      },
    ],
  },
  {
    year: "2020년",
    months: [
      {
        month: "12",
        events: [
          { title: "자율지능 디지털 동반자 기술 연구 과제 성과발표회", place: "온라인" },
          { title: "GEdge Platform 제1회 컨퍼런스 개최", place: "온라인" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "CCCR TaB 2020(자율주행차, AI, 클라우드 기술 혁신과 미래) 세미나 개최", place: "CCCR" },
          { title: "2020 Smart- Factory & 5G Technology 세미나 개최", place: "COEX" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "2020 서울진로직업 박람회 자율지능디지털동반자 부스 참가", place: "온라인" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "TaB Issue Report(Technology and Business Issue Report) 발행 시작", place: "CCCR" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "2020 정보통신·방송 연구개발 사업 신규 참여", place: "IITP" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2020 정보통신·방송 연구개발 사업 신규 참여", place: "IITP" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제12회 정기총회 개최(사업 및 예산 승인)", place: "CCCR" },
        ],
      },
    ],
  },
  {
    year: "2019년",
    months: [
      {
        month: "11",
        events: [
          { title: "CCCR TaB 2019 세미나(자율주행차, AI, 클라우드) 개최", place: "COEX" },
          { title: "교통혼잡 문제해결을 위한 지능형 SW 포럼 개최", place: "COEX" },
          { title: "2019 Smart-Factory & 5G Technology 세미나 개최", place: "COEX" },
          { title: "도시교통 문제 개선을 위한 클라우드 기반 트래픽 예측 시뮬레이션 SW 기술 개발 워크샵 개최", place: "The-K호텔" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "‘제28회 코베 베이비페어’ 웰니스 서비스 체험 전시부스 참가", place: "킨텍스" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "온프레미스 스토리지와 퍼블릭 클라우드 스토리지간 데이터 통합 관리 및 신뢰성 보장 기술 개발 과제 워크샵 개최", place: "속초" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "‘제32회 정보문화의 달’ 자율주행차 체험행사 개최", place: "국립과천과학관" },
          { title: "5G 기반 생산/물류관리 서비스 및 cloud향 제조특화 ML 플랫폼 개발 과제 워크샵 개최", place: "제주" },
          { title: "자율지능 디지털 동반자 프레임워크 및 응용 연구 개발 총괄과제 워크샵 개최", place: "부여" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "2019 산업기술혁신 사업 신규 참여", place: "KEIT" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2019 정보통신·방송 연구개발 사업 신규 참여", place: "IITP" },
          { title: "2019 혁신성장 청년인재 집중양성사업 선정", place: "IITP" },
          { title: "‘대한민국과학축제’ 자율주행차 체험행사 개최", place: "청계광장" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "온프레미스 스토리지와 퍼블릭 클라우드 스토리지간 데이터 통합 관리 및 신뢰성 보장 기술 개발 과제 워크샵 개최", place: "제천" },
          { title: "API 호출 단위 자원 할당 및 사용량 계량이 가능한 서버리스 클라우드 컴퓨팅 기술 개발 과제 워크샵 개최", place: "속초" },
          { title: "제11회 정기총회 개최(사업 및 예산 승인)", place: "CCCR" },
          { title: "제4대 이사장 홍승균 SK텔레콤 그룹장 선임", place: "CCCR" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "자율지능 디지털 동반자 프레임워크 과제 총괄 진도점검회의 개최", place: "IITP" },
        ],
      },
    ],
  },
  {
    year: "2018년",
    months: [
      {
        month: "11",
        events: [
          { title: "2018 제3차 CBI 융합 기술 세미나 개최", place: "COEX" },
          { title: "2018 Smart-Factory & 5G Technology 세미나 개최", place: "COEX" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "5G 기반 생산/물류관리 서비스 및 Cloud향 제조특화 ML 플랫폼 개발 과제 워크샵 개최", place: "곤지암" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "2018 혁신성장 청년인재 집중양성사업 선정", place: "IITP" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "청년취업아카데미 취업특강 개최", place: "COEX" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "자율지능 디지털 동반자 프레임워크 및 응용 연구 개발 총괄과제 워크샵 개최", place: "제주" },
          { title: "API 호출 단위 자원 할당 및 사용량 계량이 가능한 서버리스 클라우드 컴퓨팅 기술 개발 과제 워크샵 개최", place: "곤지암" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "연구 용역 수주 - 동남아시아국가연합(ASEAN), 지능형 교통시스템 도입관련 협력 모델 조사‧분석 정책연구", place: "한국연구재단" },
          { title: "온프레미스 스토리지와 퍼블릭 클라우드 스토리지간 데이터 통합 관리 및 신뢰성 보장 기술 개발 과제 워크샵 개최", place: "속초" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2018 정보통신·방송 연구개발 사업 신규 참여", place: "IITP" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "2018 청년취업아카데미 선정", place: "한국산업인력공단" },
          { title: "제10회 정기총회 개최(사업 및 예산 승인)", place: "CCCR" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "SW 구름타고 세계로 TF 참여", place: "과학기술정보통신부" },
        ],
      },
    ],
  },
  {
    year: "2017년",
    months: [
      {
        month: "12",
        events: [
          { title: "Smart City를 위한 클라우드 융합 기술/트렌드 세미나 개최", place: "COEX" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2017년 제2차 CBI 융합기술 세미나 개최", place: "COEX" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "청년취업아카데미사업 추가 선정", place: "한국산업인력공단" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "연구 용역 수주 - 시스템의 정량적/정성적 성능 검증을 위한 외부 평가", place: "ETRI" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "클라우드컴퓨팅 전문인력 양성기관 지정(지정번호: 2017-01)", place: "미래창조과학부" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "클라우드컴퓨팅 기술스택 보고서 V3.0 발간", place: "CCCR" },
          { title: "정보통신·방송 연구개발 사업 신규 참여(3개 과제)", place: "IITP" },
          { title: "이공계전문기술연수사업 선정", place: "한국산업기술진흥협회" },
          { title: "클라우드 인력양성을 위한 MOU 체결", place: "건국대, NIA" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제9회 정기총회 개최(사업 및 예산 승인)", place: "파크루안" },
          { title: "청년취업아카데미사업 선정", place: "한국산업인력공단" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "2017년 제1차 CBI 융합기술 세미나 개최", place: "COEX" },
          { title: "2017 국방분야 ICT 협력 강화 MOU 체결", place: "(사)국방정보통신협회" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "ITU-T 학계회원 멤버십 획득(국제 표준 추진)", place: "ITU" },
        ],
      },
    ],
  },
  {
    year: "2016년",
    months: [
      {
        month: "11",
        events: [
          { title: "2016 청년취업아카데미 취업설명회 개최", place: "COEX" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "연구 용역 수주 - 다중 클라우드 연계 활용을 위한 한국형 클라우드 기술 스택 연구", place: "ETRI" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "방송통신 정책연구 사업 선정 - 클라우드 활성화 촉진을 위한 세부 이행방안 연구", place: "IITP" },
          { title: "ICBMS 기술 생태계 확산을 위한 산학연 연계 워크샵 개최", place: "제주ICC" },
          { title: "2016 클라우드 전문기술 교육사업 선정", place: "NIPA" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "제1회 창조국방 ICT 기술·장비 전시회 부스 참가", place: "COEX" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제8회 클라우드 데이 개최", place: "The-K호텔" },
          { title: "2016 청년취업아카데미 선정", place: "한국산업인력공단" },
          { title: "제8회 정기총회 개최(사업 및 예산 승인)", place: "벨레상스호텔" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "클라우드컴퓨팅 기술 스택 v2.1 발간", place: "CCCR" },
        ],
      },
    ],
  },
  {
    year: "2015년",
    months: [
      {
        month: "12",
        events: [
          { title: "클라우드컴퓨팅 기술 스택 v2.0 발간", place: "" },
          { title: "CBI 세미나 개최", place: "COEX" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "제1회 공공기관 클라우드 도입 세미나 개최", place: "대전" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "빅데이터 심포지엄 개최", place: "COEX" },
          { title: "2015 청년취업아카데미사업 클라우드 취업설명회 개최", place: "BEXCO" },
          { title: "클라우드 EXPO Korea 2015 참가 · 14부스 구성 참가(R&D)", place: "BEXCO" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "클라우드컴퓨팅 기술 스택 v1.4 발간", place: "" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "클라우드 교육·홍보 TF 간사 활동", place: "" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "2015 청년취업아카데미 선정", place: "한국산업인력공단" },
          { title: "2015 클라우드 전문인력 양성사업 수행기관 선정", place: "NIPA" },
          { title: "2015 국가 표준개발협력기관(COSD) 지정", place: "국가기술표준원" },
        ],
      },
    ],
  },
  {
    year: "2014년",
    months: [
      {
        month: "12",
        events: [
          { title: "컴퓨팅 장비 경쟁력 강화전략 업체 간담회 개최", place: "미래창조과학부" },
          { title: "클라우드컴퓨팅 육성전략 참여", place: "" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "제7회 클라우드 데이 주관", place: "COEX" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "클라우드 EXPO Korea2014(부산) 참가", place: "NIPA" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "과제발굴연구회 선정", place: "중소기업청" },
          { title: "2014 SW융합채용연수사업 운영기관 선정", place: "NIPA" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "2014 SW융합역량강화(재직자)과정 파트너기관 선정", place: "NIPA" },
          { title: "CBI 세미나 개최", place: "" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "2014 산업융합원천기술개발 과제 참여", place: "KEIT" },
          { title: "제1회 클라우드 데이 주관", place: "미래부 주최" },
          { title: "사용자인터페이스표준화포럼 장관상 수상", place: "미래부" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "방송통신정책연구사업 수주", place: "IITP" },
          { title: "국가 표준개발협력기관(COSD) 지정", place: "기술표준원" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제6회 정기총회 개최(사업 및 예산 승인)", place: "" },
          { title: "2014 청년취업아카데미 선정", place: "한국산업인력공단" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "2014 현장기술인력재교육사업 파트너기관 선정", place: "대한상공회의소" },
          { title: "CBI 세미나 개최", place: "" },
        ],
      },
    ],
  },
  {
    year: "2013년",
    months: [
      {
        month: "12",
        events: [
          { title: "컴퓨팅 장비 경쟁력 강화전략 업체 간담회 개최", place: "미래창조과학부" },
          { title: "클라우드컴퓨팅 육성전략 참여", place: "" },
          { title: "클라우드컴퓨팅 인력 실태조사", place: "KISA" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2013 차세대컴퓨팅 전시회 및 컨퍼런스 개최", place: "COEX" },
          { title: "2013 제2차 클라우드 핫이슈 세미나 개최", place: "" },
          { title: "2013 제2차 사용자인터페이스 표준화 포럼 세미나 개최", place: "" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "2014 ICT 표준전략맵 공청회 참석", place: "TTA" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "2013 차세대컴퓨팅 신규 R&D 과제 워크샵 개최", place: "KEIT" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "교육위원회 개최", place: "" },
          { title: "연구조합연합회 간담회 참석", place: "" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "2013 SW융합역량강화(재직자)과정 파트너기관 선정", place: "NIPA" },
          { title: "2013 제1차 클라우드 핫이슈 세미나 개최", place: "" },
          { title: "2013 사용자인터페이스 표준화 포럼 총회 및 제1차 세미나 개최", place: "" },
          { title: "클라우드 EXPO 2013(부산) 참가 - 클라우드 R&D관 구성(24개 부스", place: "NIPA" },
          { title: "TR 용역 수주", place: "SK텔레콤" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "사용자 인터페이스 표준화 포럼 선정(TTA 전략포럼)", place: "TTA" },
          { title: "2013 산업융합원천기술개발 과제 참여(2개 과제)", place: "KEIT" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제5회 정기총회 개최(사업 및 예산 승인)", place: "" },
          { title: "2013 청년취업아카데미 선정", place: "한국산업인력공단" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "2013 현장기술인력재교육사업 파트너기관 선정", place: "대한상공회의소" },
        ],
      },
    ],
  },
  {
    year: "2012년",
    months: [
      {
        month: "12",
        events: [
          { title: "대전대학교 MOU 체결", place: "" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2012년 차세대컴퓨팅 R&D 전시회 및 컨퍼런스 개최", place: "" },
          { title: "빅 데이터 관리 및 분석기술 워크샵 개최", place: "" },
          { title: "클라우드 컴퓨팅 비즈니스 모델 및 활용 세미나 개최", place: "" },
          { title: "빅 데이터 관리 및 분석기술 워크샵 개최", place: "" },
          { title: "2012년 차세대컴퓨팅 R&D 전시회 및 컨퍼런스 개최", place: "" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "2012년 제3회 클라우드 핫이슈 세미나 개최", place: "" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "2012년 차세대컴퓨팅 신규 R&D 과제 워크샵 개최", place: "" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "2012년 제2회 클라우드 핫이슈 세미나 개최", place: "" },
          { title: "2012년 클라우드컴퓨팅 R&D 관련 기관 워크샵 개최", place: "" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "현장기술인력재교육 클라우드 핵심기술의 이해 과정 온라인 교육 실시", place: "" },
          { title: "2012년 춘계 클라우드 재팬(한국관 기획) 참가", place: "KOTRA" },
          { title: "클라우드 산업포럼 R&D 기반확충분과 간사 참여", place: "" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "ICCCSN 2012 참석", place: "인도네시아" },
          { title: "현장기술인력재교육 Virtual Desktop 과정 온라인 교육 실시", place: "" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제4회 정기총회 개최 (사업 및 예산 승인)", place: "" },
          { title: "2012년 제 1회 클라우드 핫이슈 세미나 개최", place: "" },
          { title: "현장기술인력재교육 모바일 클라우드/CTO 과정 교육 실시", place: "" },
        ],
      },
    ],
  },
  {
    year: "2011년",
    months: [
      {
        month: "12",
        events: [
          { title: "2011.12. 2012 해외전시 지원사업 선정 (노동부)", place: "" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2011년 SW·컴퓨팅 R&D 전시회 및 컨퍼런스 개최", place: "" },
          { title: "Virtualization Workshop 2011", place: "" },
          { title: "'클라우드 컴퓨팅 비즈니스 모델 및 활용'", place: "" },
          { title: "현장기술인력재교육사업 선정", place: "" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "제 8차 이사회 개최", place: "" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "그린 IDC 국내/국제표준화 및 고전압 직류 배전 기술 상용화를 위한 표준 인터페이스 규격 개발", place: "" },
          { title: "용역 계약 체결", place: "" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "2011 과제발굴연구회 과제 선정 (중소기업청)", place: "" },
          { title: "2011 클라우드 컴퓨팅 R&D 과제 워크샵 개최", place: "" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "2011 법무처 (지식경제부, 행정안전부, 방송통신위원회) 클라우드 컴퓨팅 정책협의회 참석", place: "" },
          { title: "2011 클라우드 컴퓨팅 표준 기본 계획 수립 참여 (지식경제부 기술표준원, 클라우드 컴퓨팅, 코디네이터)", place: "" },
          { title: "제 7차 이사회 개최", place: "" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "2011년 제1차 클라우드 컴퓨팅 전문가 양성과정 교육 실시 (5.30~6.3, 스타타워)", place: "" },
          { title: "충북 산업단지 클라우드 컴퓨팅 테스트베드 구축사업 참여 (지식경제부)", place: "" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2011 클라우드 컴퓨팅 산업 아웃룩 포럼 개최 (서울교육문화회관) - 지식경제부 주최", place: "" },
          { title: "2011 차세대 컴퓨팅 R&D 워크샵 (신규과제) 개최", place: "" },
          { title: "클라우드 컴퓨팅 포럼 협략 체결 (클라우드 기술 프레임워크 분과) - 가상화 기술 포럼 연계", place: "" },
          { title: "연구조합 분과위원회 킥오프 미팅", place: "" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "제 3차 정기총회 및 제 7차 이사회 개최", place: "" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "2011 MN-MATE 워크샵 개최 (코엑스) - KAIST, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
    ],
  },
  {
    year: "2010년",
    months: [
      {
        month: "12",
        events: [
          { title: "Web Korea Forum Conference 2010 개최 (한국정보화진흥원 대회의실)", place: "" },
          { title: "2010년 온라인 뉴스레터 총 23회 발간", place: "" },
          { title: "임시총회 및 제 6차 이사회 개최", place: "" },
        ],
      },
      {
        month: "11",
        events: [
          { title: "2010년 지식경제부 그린/클라우드 컴퓨팅 R&D 성과발표회 개최 - ITSA, ETRI, KEA 공동개최", place: "" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "제 5차 이사회 개최", place: "" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "2010 차세대 컴퓨팅 R&D 워크샵 (신규과제) 개최 - KEIT, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "중간조직활성화 사업 선정 (지식경제부)", place: "" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "Virtualization Workshop 2010 개최 - ETRI, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
      {
        month: "06",
        events: [
          { title: "2010년 과제발굴연구회 사업 선정 (중소기업청)", place: "" },
        ],
      },
      {
        month: "05",
        events: [
          { title: "임시총회 및 제 4차 이사회 개최", place: "" },
          { title: "제 2대 이사장 선출 : 임종태 (SK텔레콤 기술원 원장) 취임", place: "" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "2010 차세대 컴퓨팅 R&D 워크샵 (신규과제) 개최 - KEIT, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "산업융합원천기술개발사업 과제 선정 (지식경제부) - 단말 독립형 퍼스널 클라우드 시스템 (2010~13)", place: "" },
          { title: "2010 차세대 컴퓨팅 R&D 워크샵 (계속과제) 개최 - KEIT, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
      {
        month: "02",
        events: [
          { title: "TTA 클라우드 컴퓨팅PG420 간사기관 선정", place: "" },
          { title: "제 2차 총회 및 제 3차 이사회 개최", place: "" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "법무처 (지식경제부, 행정안전부, 방송통신위원회) 클라우드 컴퓨팅 정책협의회 참여", place: "" },
        ],
      },
    ],
  },
  {
    year: "2009년 이전",
    months: [
      {
        month: "12",
        events: [
          { title: "온라인 뉴스레터 서비스 개시", place: "" },
          { title: "제 2차 이사회 개최", place: "" },
        ],
      },
      {
        month: "10",
        events: [
          { title: "그림 Com, Summit 개최 (JW메리어트호텔) - ITSA, 한국차세대컴퓨팅학회 공동 개최", place: "" },
        ],
      },
      {
        month: "09",
        events: [
          { title: "ITSA, 한국차세대컴퓨팅학회 MOU 체결", place: "" },
        ],
      },
      {
        month: "08",
        events: [
          { title: "국방부 대상 세미나 개최 (대전 KAIST)", place: "" },
        ],
      },
      {
        month: "07",
        events: [
          { title: "클라우드 컴퓨팅 R&D 테스트베드 오픈 (KAIST)", place: "" },
          { title: "CCI:U 론칭 (서울대, KAIST 등에 무료서비스)", place: "" },
          { title: "KAIST, (주)넥스알 MOU 체결", place: "" },
        ],
      },
      {
        month: "04",
        events: [
          { title: "제 1차 이사회 개최", place: "" },
        ],
      },
      {
        month: "03",
        events: [
          { title: "산업융합기술개발사업 과제 선정 (지식경제부)", place: "" },
          { title: "독립형 컴포넌트 기반 서비스 지향형 페타급 컴퓨팅 플렛폼 기술개발 (2009~2012)", place: "" },
        ],
      },
      {
        month: "01",
        events: [
          { title: "법인 설립 인가 (지식경제부)", place: "" },
        ],
      },
      {
        month: "2008/12",
        events: [
          { title: "창립총회 : 초대 이사장 한재선(넥스알 대표이사) 취임", place: "" },
        ],
      },
    ],
  },
];

/* 조직도 — 4열 격자 기준 좌표(col: 0~3)로 배치한다. */
export const ORG_UNITS = {
  assembly: "총회",
  chair: "이사장",
  board: "이사회",
  audit: "감사",
  advisory: "자문위원회",
  office: "사무국",
  teams: ["연구개발팀", "기획팀", "총무팀", "연구비관리팀"],
};

export type Department = {
  name: string;
  tel: string;
  email: string;
};

export const DEPARTMENTS: Department[] = [
  { name: "사무국", tel: "02-2052-0156", email: "admin@cccr.or.kr" },
  { name: "연구개발팀", tel: "02-2052-0132", email: "dwkim@cccr.or.kr" },
  { name: "기획팀", tel: "02-2052-0155", email: "mhshin@cccr.or.kr" },
  { name: "총무팀", tel: "02-2052-0156", email: "admin@cccr.or.kr" },
  { name: "연구비관리팀", tel: "02-2052-0156", email: "hjsong@cccr.or.kr" },
];

export const ORG_ROLES = [
  { label: "총회", value: "조합의 최고 의결기구로 정관 변경, 사업계획 및 예산·결산 승인, 임원 선출을 의결합니다." },
  { label: "이사회", value: "총회에서 위임한 사항과 조합 운영에 관한 주요 사항을 심의·의결합니다. 회원 가입 승인도 이사회를 거칩니다." },
  { label: "이사장", value: "조합을 대표하고 업무를 총괄합니다. 총회와 이사회의 의장을 맡습니다." },
  { label: "감사", value: "조합의 업무와 회계를 감사하고 그 결과를 총회에 보고합니다." },
  { label: "자문위원회", value: "산·학·연 전문가가 참여해 연구개발 방향과 사업 추진에 관한 자문을 제공합니다." },
  { label: "사무국", value: "조합의 일상 업무를 수행합니다. 연구개발팀·기획팀·총무팀·연구비관리팀으로 구성됩니다." },
];

export type TransitItem = { badges: string[]; text: string };
export type TransitGroup = { group: string; items: TransitItem[] };

export type Office = {
  name: string;
  address: string;
  tel: string;
  fax: string;
  note: string;
  transit: TransitGroup[];
};

export const OFFICES: Office[] = [
  {
    name: "삼성 사무실",
    address: "강남구 삼성로86길 11, 거봉INC빌딩 5층",
    tel: "02-2052-0156",
    fax: "02-2052-0158",
    note: "삼성역 4번 출구에서 포스코사거리 방향으로 약 600m 직진 – 도보 10분거리",
    transit: [
      {
        group: "시내버스",
        items: [
          { badges: ["B"], text: "파랑(간선) 360번 (한국무역센터, 삼성역 하차)" },
          { badges: ["G"], text: "초록(지선) 3411번, 2416번 (한국무역센터, 삼성역 하차)" },
        ],
      },
      {
        group: "지하철",
        items: [
          { badges: ["3", "7"], text: "지하철 3호선 탑승 (강남고속터미널) → 교대역에서 2호선으로 환승 → 삼성역 하차(4번출구)" },
          { badges: ["2"], text: "지하철 2호선 탑승 (강변역) → 삼성역 하차(4번출구)" },
          { badges: ["3"], text: "지하철 3호선 탑승 (남부시외버스터미널역) → 교대역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)" },
        ],
      },
      {
        group: "기차 이용시",
        items: [
          { badges: ["1"], text: "지하철 1호선 탑승(영등포역) → 신도림역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)" },
          { badges: ["4"], text: "지하철 4호선 탑승(서울역) → 사당역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)" },
        ],
      },
    ],
  },
  {
    name: "구로 교육장(CCCR 아카데미)",
    address: "서울특별시 구로구 디지털로33길 50 벽산디지털밸리7차 2층, 14층",
    tel: "02-3644-7355",
    fax: "02-3644-7351",
    note: "구로디지털단지역 3번 출구에서 대림 방향으로 약 900m – 도보 15분거리",
    transit: [
      {
        group: "시내버스",
        items: [
          { badges: ["G"], text: "초록(지선) 5616번 (디지털산업1단지 정류장 하처)" },
          { badges: ["G"], text: "초록(마을버스) 구로09번 (에이스테크노타워 정류장 하차)" },
        ],
      },
      {
        group: "지하철",
        items: [
          { badges: ["2"], text: "지하철 2호선 탑승 (강변역) → 구로디지털단지역 하차(3번출구)" },
          { badges: ["7"], text: "지하철 7호선 탑승 (강남고속터미널) → 남구로역 하차(1번출구)" },
        ],
      },
      {
        group: "기차 이용시",
        items: [
          { badges: ["1"], text: "지하철 1호선 탑승 (서울역/용산역/영등포역) → 신도림역에서 2호선으로 환승 → 2호선 구로디지털단지역 하차(3번출구)" },
        ],
      },
    ],
  },
];

/* 노선·버스 배지 색 (서울교통공사·서울시 버스 표준색) */
export const BADGE_COLOR: Record<string, string> = {
  "1": "#0052A4",
  "2": "#00A84D",
  "3": "#EF7C1C",
  "4": "#00A5DE",
  "7": "#747F00",
  B: "#3D5BAB",
  G: "#53B332",
};

/* ── 회원사 ───────────────────────────────────────── */

export type Member = { name: string; site: string };

export type MemberGroup = {
  grade: string;
  desc: string;
  members: Member[];
};

/* 조합 제공 명단 기준. site는 프로토콜 없이 표기한다. */
export const MEMBER_GROUPS: MemberGroup[] = [
  {
    grade: "이사장사",
    desc: "조합 이사장을 맡고 있는 회원사입니다.",
    members: [{ name: "SK텔레콤(주)", site: "www.sktelecom.com" }],
  },
  {
    grade: "임원사",
    desc: "이사회를 구성해 조합 운영과 사업 방향을 결정합니다.",
    members: [
      { name: "(주)노브레이크", site: "www.nobreak.co.kr" },
      { name: "(주)디노아이티", site: "www.dinnoit.com" },
      { name: "디포커스(주)", site: "www.dfocus.net" },
      { name: "메가존클라우드(주)", site: "www.megazone.com" },
      { name: "(주)모비젠", site: "www.mobigen.com" },
      { name: "(주)소프트웍스", site: "www.softworks.co.kr" },
      { name: "슈어소프트테크(주)", site: "www.suresofttech.com" },
      { name: "(주)어니언소프트웨어", site: "www.onionsoftware.com" },
      { name: "(주)엔텔스", site: "www.ntels.com" },
      { name: "(주)위즈온텍", site: "www.wizontech.com" },
      { name: "스트라토(주)", site: "www.strato.co.kr" },
      { name: "제스프로(주)", site: "www.zespro.co.kr" },
      { name: "(주)투라인클라우드", site: "www.twolinecloud.com" },
      { name: "(주)틸론", site: "www.tilon.co.kr" },
      { name: "SK(주)", site: "cc.sk.co.kr" },
    ],
  },
  {
    grade: "일반회원사",
    desc: "조합 사업과 공동 연구개발에 참여하는 회원사입니다.",
    members: [
      { name: "가이저소프트", site: "www.geysersoft.com" },
      { name: "(주)글루시스", site: "www.gluesys.com" },
      { name: "(주)내프터", site: "www.i-nafter.com" },
      { name: "(주)다음커뮤니케이션", site: "www.daum.net" },
      { name: "(주)더존비즈온", site: "www.duzon.co.kr" },
      { name: "(주)덕산정보통신", site: "www.ducsan.co.kr" },
      { name: "(주)디씨온", site: "www.dc-on.co.kr" },
      { name: "(주)리눅스데이타시스템", site: "www.linuxdata.co.kr" },
      { name: "(주)모바일리더", site: "www.mobileleader.com" },
      { name: "(주)메트릭스리서치", site: "www.metrix.co.kr" },
      { name: "(주)메트릭스코퍼레이션", site: "www.metrix.co.kr" },
      { name: "(주)바이텍씨스템", site: "www.bitek.co.kr" },
      { name: "(주)발해", site: "www.ubalhae.com" },
      { name: "(주)스마트코어", site: "www.smcore.co.kr" },
      { name: "(주)에즈웰", site: "www.azwell.co.kr" },
      { name: "(주)와치텍", site: "www.watchtek.co.kr" },
      { name: "유씨웨어", site: "www.ucware.jp" },
      { name: "(주)유큐브", site: "www.u-cube.kr" },
      { name: "(주)유플렉스소프트", site: "www.uplexsoft.com" },
      { name: "(주)엔에프랩", site: "www.nflabs.com" },
      { name: "(주)엔키아", site: "www.nkia.co.kr" },
      { name: "(주)엠씨에스텍", site: "www.mcst.co.kr" },
      { name: "(주)엠앤엘솔루션", site: "www.mnlsolution.com" },
      { name: "(주)이노룰스", site: "www.innorules.com" },
      { name: "(주)이엑스프로모션", site: "www.expromotion.co.kr" },
      { name: "(주)커머스플래닛", site: "www.commerceplanet.co.kr" },
      { name: "(주)코리아데이타네트워크", site: "www.kdn21.co.kr" },
      { name: "(주)코아넷", site: "www.corenetkorea.com" },
      { name: "코포워드", site: "www.coforward.com" },
      { name: "(주)클라우다이크", site: "www.cloudike.co.kr" },
      { name: "(주)클루닉스", site: "www.clunix.com" },
      { name: "(주)케이티", site: "www.kt.com" },
      { name: "(주)티맥스클라우드", site: "www.tmaxanc.com" },
      { name: "(주)퓨전데이타", site: "www.fusionsys.net" },
      { name: "(주)한위드정보기술", site: "www.hanwith.com" },
      { name: "(주)휴버텍", site: "www.huevertech.com" },
      { name: "메가존(주)", site: "www.mz.co.kr" },
      { name: "멘토미디어", site: "www.mentormedia.co.kr" },
      { name: "중앙ICS", site: "www.caics.co.kr" },
      { name: "비비엠씨(주)", site: "www.bbmc.co.kr" },
      { name: "세인특허법률사무소", site: "www.wpip.co.kr" },
      { name: "오케스트로(주)", site: "www.okestro.com" },
      { name: "청담정보기술(주)", site: "www.cdit.co.kr" },
      { name: "케이웨어(주)", site: "www.kware.co.kr" },
      { name: "티원소프트(주)", site: "www.tonesoft.co.kr" },
      { name: "플랙토리(주)", site: "www.flectory.kr" },
      { name: "한전케이디엔(주)", site: "www.kdn.com" },
    ],
  },
  {
    grade: "준회원사",
    desc: "조합 주도 과제에 참여하는 기업·기관은 별도 가입절차와 가입비 없이 준회원으로 자동 가입됩니다.",
    members: [
      { name: "(주)다보링크", site: "www.davolink.co.kr" },
      { name: "(주)데이터스트림즈", site: "www.datastreams.co.kr" },
      { name: "(주)델타시스템", site: "www.deltago.co.kr" },
      { name: "(주)디코스인터랙티브", site: "www.dcosi.co.kr" },
      { name: "(주)마하넷", site: "www.maha-net.co.kr" },
      { name: "(주)메이티", site: "www.matey.co.kr" },
      { name: "(주)민인포", site: "www.mininfo.co.kr" },
      { name: "(주)바오솔루션스", site: "www.baosolutions.co.kr" },
      { name: "(주)솔박스", site: "www.solbox.com" },
      { name: "(주)씨씨미디어", site: "www.ccmedia.co.kr" },
      { name: "(주)아이네트호스팅", site: "www.inet.co.kr" },
      { name: "(주)아이넷테크", site: "www.inettch.com" },
      { name: "(주)아이티코리아", site: "www.it-korea.ne.kr" },
      { name: "(주)아침정보기술", site: "www.morningit.com" },
      { name: "(주)에니스", site: "enis1.modoo.at" },
      { name: "(주)에즈웰", site: "www.azwellsys.com" },
      { name: "(주)에트피아텍", site: "www.atpia.co.kr" },
      { name: "(주)위더스텍", site: "www.withustech.com" },
      { name: "(주)윈드소울", site: "www.windsoul.com" },
      { name: "(주)인에이지", site: "www.enage.com" },
      { name: "(주)인젠트", site: "www.inzent.com" },
      { name: "(주)지트론정보통신", site: "www.gtron.co.kr" },
      { name: "(주)지티솔루션", site: "www.gtsolution.co.kr" },
      { name: "(주)컴스", site: "www.coms.co.kr" },
      { name: "(주)케이쓰리아이", site: "www.k3i.co.kr" },
      { name: "(주)케이엠넷", site: "www.km-net.co.kr" },
      { name: "(주)케이티엔에프", site: "www.ktnf.co.kr" },
      { name: "(주)크레블", site: "www.creble.com" },
      { name: "(주)테크바일", site: "www.techbile.com" },
      { name: "(주)트라이얼정보통신", site: "www.trialinfo.com" },
      { name: "(주)팍스디스크", site: "www.paxdisk.com" },
      { name: "AIS테크놀러지(주)", site: "www.aisnw.com" },
      { name: "대신정보기술(주)", site: "www.daeshin-it.com" },
      { name: "모비루스", site: "www.mobilus.co.kr" },
      { name: "서울디지텍고등학교", site: "www.sdh.hs.kr" },
      { name: "소나무미디어(주)", site: "www.sonamumedia.com" },
      { name: "신세계INC", site: "www.sinc.co.kr" },
      { name: "아이티뱅크", site: "www.itb21.co.kr" },
      { name: "엔아이티(주)", site: "www.n-it.co.kr" },
      { name: "와이즈미디어(주)", site: "www.wisemedia.co.kr" },
      { name: "케이엘정보통신(주)", site: "www.klic.co.kr" },
      { name: "한국 IBM", site: "www.ibm.com/kr" },
      { name: "한국Oracle", site: "www.oracle.com/kr" },
      { name: "한국VMware", site: "www.vmware.com/kr" },
      { name: "한국컴퓨터(주)", site: "www.korea-computer.co.kr" },
      { name: "한국휴렛팩커드유한회사", site: "www.hp.com" },
    ],
  },
];

const memberCount = (grade: string) =>
  MEMBER_GROUPS.find((g) => g.grade === grade)?.members.length ?? 0;

export const MEMBER_TOTAL = MEMBER_GROUPS.reduce((n, g) => n + g.members.length, 0);

/* 숫자는 명단에서 세므로 명단만 고치면 통계도 따라온다. */
export const MEMBER_STATS = [
  { label: "전체 회원사", value: String(MEMBER_TOTAL), unit: "개사" },
  { label: "임원사", value: String(memberCount("임원사")), unit: "개사" },
  { label: "일반회원사", value: String(memberCount("일반회원사")), unit: "개사" },
  { label: "준회원사", value: String(memberCount("준회원사")), unit: "개사" },
];

/* ── 회원사 가입안내 ──────────────────────────────── */

/* 원본 가입안내의 등급별 회비. 연회비·가입비 두 표를 한 표로 합쳤다. */
export const FEE_TABLE = [
  { grade: "임원사(이사회 선임)", entry: "200만원 이상", annual: "300만원 이상" },
  {
    grade: "일반회원사",
    entry: "대기업 : 100만원 / 중소기업 : 50만원",
    annual: "대기업 : 100만원 / 중소기업 : 50만원",
  },
  { grade: "대학 및 연구소", entry: "0원", annual: "0원" },
];

/* 원본 가입안내의 탭 3개. 한 페이지에 펴고 목차 링크로 쓴다. */
export const JOIN_SECTIONS = [
  { id: "join-target", label: "회원가입 대상" },
  { id: "join-benefits", label: "회원가입 특전" },
  { id: "join-guide", label: "일반회원 가입안내" },
];

export const JOIN_TARGET = {
  grade: "정회원",
  target: "클라우드 컴퓨팅 관련 기업, 기관, 단체 등",
};

export const MEMBER_BENEFITS = [
  "과제 참여안내 및 컨소시엄 구성 지원",
  "기업경영 애로사항 및 건의사항 수렴",
  "조합 관련 국내외 행사에 우선 참여 및 지원",
  "각종 조합 주도 모임 초청",
  "각종 조사 자료 (국내외 자료 및 통계자료) 및 간행물 무료 배포",
  "임원사는 임원선임 및 총회 의결권 보유함",
  "준회원사는 위의 특전과 상이할 수 있음",
];

export const JOIN_STEPS = [
  { title: "관련서류 제출" },
  { title: "가입비 및 연회비 입금" },
  { title: "조합 승인" },
  { title: "회원번호 부여" },
];

export const JOIN_DOCS = [
  "가입신청서 (소정양식)",
  "법인등기부등본 1부",
  "사업자등록증사본 1부",
  "대표자 이력서 1부 (대표자 사진필요, 증명사진 없을 시 사진 인쇄도 가능)",
  "회사소개 브로슈어 1부",
];

export const JOIN_DOC_NOTES = [
  "우편 송부 또는 직접 방문 제출",
  "임원사 희망기관은 연구조합 담당자에게 개별 문의 바람",
];

export const JOIN_ACCOUNT = {
  bank: "우리은행 1005-901-454240",
  holder: "한국클라우드컴퓨팅연구조합",
};

/* 주소는 사무국 이전 후 주소(찾아오시는 길·푸터와 동일)를 쓴다. */
export const JOIN_CONTACT = {
  team: "한국클라우드컴퓨팅연구조합 조합회원 입회 담당자",
  address: "서울특별시 강남구 삼성로86길 11, 거봉INC빌딩 5층",
  tel: "02-2052-0156",
  fax: "02-2052-0158",
  email: "admin@cccr.or.kr",
};

/* ── 사업안내 ─────────────────────────────────────── */

export type NeedItem = { text: string; sub?: string[] };

export const NEEDS: { title: string; items: NeedItem[] }[] = [
  {
    title: "IT 신산업 및 컴퓨팅 환경에서의 컴퓨팅 수요의 급증",
    items: [
      {
        text: "의료, 항공, 환경 등의 산업 분야와 IT융합 환경에서 대규모 유비쿼터스 데이터의 실시간 컴퓨팅을 위한 대용량의 컴퓨팅 수요가 증가함. 이를 충족하기 위해서는 기존의 컴퓨팅 환경보다 더욱 동적이고, 편리하고, 영리한 고성능 컴퓨팅 기술이 요구됨",
      },
      {
        text: "웹2.0의 성공과 함께 앞으로 많은 애플리케이션이 웹 기반으로 서비스될 전망이며, 이러한 웹 기반 애플리케이션의 증가는 엄청난 양의 컴퓨팅 수요를 수반함. 이에 따라 웹3.0의 진화에 기반이 되는 클라우드 컴퓨팅 기술이 요구됨",
      },
      {
        text: "시간과 장소에 제약을 받지 않는 컴퓨팅 서비스에 대한 기업들의 요구가 증가함에 따라 차세대 컴퓨팅 패러다임은 웹 서비스 기반의 고성능, 대용량, 중앙집중형 컴퓨팅 클라우드로 발전하고 있으며, 국내에서도 선진국과의 기술 격차를 줄이고 신기술 개발을 통한 컴퓨팅 인프라 고도화 및 신산업 창출을 위해 정부 주도의 지원이 필요함",
      },
      {
        text: "특히 IPTV 관련 산업의 발전과 웹 환경에서의 미디어 컨텐츠의 폭발적인 증가에 따라 무수히 많은 미디어의 관리와 서비스 수요의 충족을 위해 클라우드 컴퓨팅 기술을 이용한 차세대 컴퓨팅 플랫폼 기술이 요구됨",
      },
    ],
  },
  {
    title: "그리드 기술을 활용한 클라우드 컴퓨팅 고도화 기술 확보",
    items: [
      {
        text: "클라우드 컴퓨팅(Cloud Computing)은 Amazon, Google, IBM 등에 의하여 도입되어 웹 기반 애플리케이션의 플랫폼으로서 서비스 되고 있으나 아직 안정성이나 가용성에 있어서 약점을 가지고 있어서 차세대 데이터 센터등의 중심 기술이 되기에는 부족함",
      },
      {
        text: "그리드 기술은 과학기술 응용 분야에 있어서 페타 스케일의 고성능 컴퓨팅 능력을 제공하는 안정적인 컴퓨팅 인프라 구축 기술로서, 현재의 클라우드 컴퓨팅에 접목할 경우 가용성과 안정성이 보장되면서 기업 애플리케이션에 적합한 고성능 클라우드 컴퓨팅 환경을 구축할 수 있음",
      },
    ],
  },
  {
    title: "클라우드 컴퓨팅 센터를 통한 대학 및 벤쳐/중소기업 경쟁력 강화",
    items: [
      {
        text: "글로벌 IT 기업들은 독자적인 클라우드 컴퓨팅 센터를 구축하여 대학과 기업들에 공개함으로써 미래 컴퓨팅 기술 확보와 테스팅에서 선도적인 위치를 선점하려고 시도함",
        sub: [
          "IBM 클라우드 컴퓨팅 센터 (영국, 중국, 인도, 아프리카, 일본, 미국, 독일)",
          "HP/Intel/Yahoo! 오픈 클라우드 컴퓨팅 테스트베드",
          "Google/IBM 대학 클라우드 컴퓨팅 테스트베드",
          "Yahoo! 대학 R&D 분산 컴퓨팅 클러스터",
        ],
      },
      {
        text: "IT 융합시대에 점점 대용량/대규모화 되어가는 데이터와 서비스를 수용하기 위해서 분산 컴퓨팅 기술이 핵심 기술로 떠오르고 있는 현실에서, 대학에 클라우드 컴퓨팅 테스트베드를 제공함으로써 학생들에게 최신 컴퓨팅 환경을 경험하게 하여 글로벌 경쟁력을 가지도록 할 필요가 있음",
      },
      {
        text: "빠른 Time-to-Market이 요구되는 비즈니스 환경에서, 벤쳐 및 중소기업이 IT 융합 서비스 프로토타입을 신속히 개발하고 시험해 볼 수 있게 하기 위해 클라우드 컴퓨팅 테스트베드를 제공할 필요가 있음",
      },
      {
        text: "웹 2.0의 등장과 함께 쏟아져 나오고 있는 Mashup 서비스 시장에서 국내 IT 산업의 영향력이 매우 미미한 상황인데 이를 극복하기 위해 IT 전문인력들이 쉽게 서비스를 개발하고 테스트할 수 있는 클라우드 컴퓨팅 테스트베드를 제공하여 새로운 벤쳐 기업이 활성화될 수 있는 분위기 조성이 필요함",
      },
    ],
  },
];

export const PROGRAMS: { title: string; items: string[] }[] = [
  {
    title: "국책연구 개발사업 기획 및 수행",
    items: [
      "클라우드 컴퓨팅 관련 요소 기술 분석 및 정의",
      "클라우드 컴퓨팅 기술 수요조사 및 제안",
      "국책연구개발사업 기획 및 수행",
    ],
  },
  {
    title: "산학연 공동 기술개발 사업추진",
    items: [
      "국책연구개발사업 참여를 위한 기술개발 수요조사 실시",
      "대학 · 연구소를 위한 연구개발 이슈 도출",
      "기술별 분과위원회 활성화",
    ],
  },
  {
    title: "전문 인력양성 관련 대학교육 활성화",
    items: [
      "클라우드 컴퓨팅 전문가 양성계획 수립",
      "대학의 클라우드 컴퓨팅 수업 개설 지원",
      "클라우드 컴퓨팅 기술개발 인력 Pool DB 구축 추진",
      "전문 인력 수급 대안 마련과 대 정부 건의",
    ],
  },
  {
    title: "클라우드 컴퓨팅 기술 보급 및 산업 활성화",
    items: [
      "클라우드 컴퓨팅 기반 서비스 개발 방법론 수립 및 교육",
      "클라우드 컴퓨팅 관련 컨퍼런스 및 워크샵, 단기강좌 개설",
      "관련 국제행사 유치 및 해외 전문기관들과의 교류",
      "클라우드 컴퓨팅 테스트베드 운영 및 커뮤니티 활성화",
    ],
  },
];

/* ── 게시판 · 정보서비스 ──────────────────────────── */

export type BoardRow = {
  no: number;
  category: string;
  agency: string;
  title: string;
  date: string;
  views: number;
  isNew?: boolean;
};

export const NOTICES: BoardRow[] = [
  { no: 148, category: "교육", agency: "KCIA", title: "AIDC 인프라를 위한 HW/SW 기반 설계 운영·최적화 실무 교육 (9/9~11)", date: "2026-08-07", views: 342, isNew: true },
  { no: 147, category: "모집", agency: "CCCR/KCIA", title: "새싹 동대문 4기 기업연계형 AI 서비스·클라우드 실무 과정 교육생 모집", date: "2026-08-01", views: 511, isNew: true },
  { no: 146, category: "공고", agency: "과기정통부", title: "2026년도 소프트웨어 산업발전 유공자 포상계획 공고 (~7/24)", date: "2026-07-03", views: 288 },
  { no: 145, category: "교육", agency: "KCIA", title: "GPU 프로그래밍 모델 및 최적화 교육 접수 안내 (5/18~7/8)", date: "2026-06-30", views: 623 },
  { no: 144, category: "공고", agency: "KEIT", title: "2026년도 K-온디바이스 AI반도체 기술개발사업 신규 지원대상 연구개발과제 공고", date: "2026-06-20", views: 754 },
  { no: 143, category: "조사", agency: "IITP", title: "(소프트웨어분야) 정보통신·방송 연구개발사업 신규과제 기술수요조사 안내", date: "2026-06-12", views: 402 },
  { no: 142, category: "조합", agency: "C3R", title: "2026년 상반기 정기총회 개최 결과 안내", date: "2026-05-28", views: 197 },
  { no: 141, category: "조합", agency: "C3R", title: "제4기 분과위원회 위원 모집 안내", date: "2026-05-14", views: 265 },
  { no: 140, category: "공고", agency: "NIPA", title: "2026년 AI컴퓨팅자원 활용기반 강화사업 참여기업 모집 공고", date: "2026-04-30", views: 889 },
  { no: 139, category: "조합", agency: "C3R", title: "조합 사무국 이전 안내", date: "2026-04-11", views: 154 },
];



/* ── 교육 ─────────────────────────────────────────── */

