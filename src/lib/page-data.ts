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
    year: "2023",
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

export type Member = {
  name: string;
  field: "인프라" | "플랫폼" | "서비스" | "AI·반도체" | "컨설팅";
};

export const MEMBERS: Member[] = [
  { name: "가나테크놀로지", field: "인프라" },
  { name: "다라클라우드", field: "플랫폼" },
  { name: "마바시스템즈", field: "서비스" },
  { name: "사아반도체", field: "AI·반도체" },
  { name: "자차컨설팅", field: "컨설팅" },
  { name: "카타데이터센터", field: "인프라" },
  { name: "파하소프트", field: "플랫폼" },
  { name: "누리에스에이", field: "서비스" },
  { name: "한별세미콘", field: "AI·반도체" },
  { name: "온새미로랩", field: "플랫폼" },
  { name: "미리내네트웍스", field: "인프라" },
  { name: "아라솔루션", field: "서비스" },
  { name: "라온시스템", field: "컨설팅" },
  { name: "도담클라우드", field: "플랫폼" },
  { name: "여울테크", field: "AI·반도체" },
  { name: "슬기로운데이터", field: "서비스" },
];

export const MEMBER_STATS = [
  { label: "정회원사", value: "128", unit: "개사" },
  { label: "특별회원", value: "24", unit: "개사" },
  { label: "설립", value: "2009", unit: "년" },
];

export const JOIN_STEPS = [
  { title: "가입 상담", desc: "사무국에 유선 또는 이메일로 가입 요건과 회비를 문의합니다." },
  { title: "신청서 제출", desc: "가입신청서와 구비서류를 사무국으로 제출합니다." },
  { title: "이사회 승인", desc: "이사회 심의를 거쳐 회원 가입 여부를 결정합니다." },
  { title: "회비 납부·등록", desc: "가입비와 연회비 납부 후 회원사로 정식 등록됩니다." },
];

export const JOIN_DOCS = [
  "회원 가입신청서 1부 (조합 서식)",
  "사업자등록증 사본 1부",
  "법인등기부등본 1부",
  "회사 소개서 1부",
  "직전 사업연도 재무제표 1부",
];

export const FEE_TABLE = [
  { grade: "정회원", target: "클라우드 관련 사업을 영위하는 법인", entry: "000,000원", annual: "0,000,000원" },
  { grade: "준회원", target: "설립 3년 이내 중소·벤처기업", entry: "000,000원", annual: "000,000원" },
  { grade: "특별회원", target: "대학·연구기관·비영리법인", entry: "면제", annual: "000,000원" },
];

export const MEMBER_BENEFITS = [
  { title: "공동 연구개발 참여", desc: "국가 R&D 과제 기획 단계부터 참여하고 컨소시엄 구성에 우선 고려됩니다." },
  { title: "교육과정 우대", desc: "조합이 운영하는 전 교육과정을 회원사 할인가로 수강할 수 있습니다." },
  { title: "기술·정책 정보", desc: "기술동향 리포트와 정책 자료를 회원사 전용으로 제공합니다." },
  { title: "네트워킹", desc: "분과위원회와 정기 세미나를 통해 산·학·연 협력 기회를 얻습니다." },
];

/* ── 사업안내 ─────────────────────────────────────── */

export const NEED_STATS = [
  { value: "4차", label: "산업혁명의 기반 인프라", desc: "AI·빅데이터·IoT 모두 클라우드 위에서 동작합니다." },
  { value: "SaaS", label: "공공부문 전환 확대", desc: "행정·공공 서비스의 클라우드 네이티브 전환이 진행 중입니다." },
  { value: "AI", label: "연산 자원 수요 급증", desc: "AI 학습·추론을 위한 GPU·NPU 인프라 확보가 과제입니다." },
];

export const NEED_POINTS = [
  {
    tag: "기술 난이도",
    title: "개별 기업이 감당하기 어려운 기술 난이도",
    desc: "데이터센터 설계, 대규모 오케스트레이션, AI 가속기 최적화는 단일 기업의 연구개발 역량만으로는 대응이 어렵습니다. 공동 연구를 통한 위험 분산이 필요합니다.",
  },
  {
    tag: "중복 투자",
    title: "표준 부재로 인한 중복 투자",
    desc: "상호운용성 기준이 정립되지 않으면 회원사마다 유사한 기술을 반복 개발하게 됩니다. 산업 차원의 표준화 논의가 중복 투자를 줄입니다.",
  },
  {
    tag: "인력 수급",
    title: "현장 인력 수급 불균형",
    desc: "클라우드·AI 인프라 실무 인력의 수요는 빠르게 늘고 있으나 공급이 따르지 못합니다. 산업 수요에 맞춘 교육과정 운영이 필요합니다.",
  },
  {
    tag: "제도 개선",
    title: "제도 개선 창구의 필요",
    desc: "클라우드컴퓨팅법 등 관련 제도에 산업 현장의 목소리를 전달할 통로가 필요합니다. 연구조합이 그 창구 역할을 맡습니다.",
  },
];

export const PROGRAMS = [
  {
    title: "공동 연구개발 사업",
    summary: "회원사가 함께 참여하는 클라우드 핵심기술 과제를 기획하고 수행합니다.",
    items: [
      "국가 연구개발사업 과제 기획 및 컨소시엄 구성",
      "클라우드 인프라·플랫폼 요소기술 공동 개발",
      "국산 AI반도체 기반 클라우드 실증",
      "연구 결과물의 회원사 이전 및 사업화 지원",
    ],
  },
  {
    title: "전문기술 교육사업",
    summary: "산업 현장이 요구하는 실무 역량을 갖춘 인력을 양성합니다.",
    items: [
      "클라우드컴퓨팅 전문기술 연간교육 과정 운영",
      "AIDC 인프라 설계·운영·최적화 실무 교육",
      "GPU 프로그래밍 모델 및 최적화 교육",
      "기업연계형 AI 서비스·클라우드 실무 과정",
    ],
  },
  {
    title: "정책 연구 및 건의",
    summary: "제도 개선 과제를 발굴해 정부와 유관기관에 전달합니다.",
    items: [
      "클라우드컴퓨팅법 및 하위법령 개정 의견 제출",
      "공공부문 클라우드 도입 제도 연구",
      "산업 실태조사 및 통계 자료 생산",
      "정부 위원회·협의체 참여",
    ],
  },
  {
    title: "정보 제공 및 교류",
    summary: "기술·시장 정보를 정리해 회원사의 의사결정을 돕습니다.",
    items: [
      "클라우드 기술동향 리포트 정기 발간",
      "산업뉴스 및 정책 공고 큐레이션",
      "분과위원회 및 정기 세미나 운영",
      "국내외 전시·컨퍼런스 참가 지원",
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

export type EventRow = {
  title: string;
  host: string;
  period: string;
  place: string;
  status: "접수중" | "예정" | "종료";
};

export const EVENTS: EventRow[] = [
  { title: "2026 K-ICT WEEK in BUSAN", host: "NIPA / BIPA", period: "2026.09.09 – 09.11", place: "부산 벡스코", status: "접수중" },
  { title: "OCP Korea Tech Day", host: "OCP", period: "2026.08.21", place: "코엑스 그랜드볼룸", status: "접수중" },
  { title: "OKESTRO OPUS 2026", host: "오케스트로", period: "2026.07.28", place: "코엑스 3층", status: "종료" },
  { title: "AI컴퓨팅자원 활용기반 강화사업 사업설명회", host: "NIPA", period: "2026.05.16", place: "온라인 생중계", status: "종료" },
  { title: "피지컬 AI 컨퍼런스 2026", host: "AI타임스", period: "2026.04.09", place: "COEX 컨퍼런스룸", status: "종료" },
  { title: "2026 DAVEIT DAY", host: "틸론", period: "2026.04.08", place: "코엑스 마곡", status: "종료" },
];

export type NewsRow = {
  category: string;
  title: string;
  summary: string;
  source: string;
  date: string;
};

export const INDUSTRY_NEWS: NewsRow[] = [
  { category: "정책", title: "공공부문 SaaS 전환 가속…행정 시스템 클라우드 네이티브 전환 본격화", summary: "정부가 공공 정보시스템의 클라우드 네이티브 전환 로드맵을 발표하면서 국내 SaaS 기업의 공공시장 진입 기회가 확대될 전망입니다.", source: "산업 동향", date: "2026-08-04" },
  { category: "시장", title: "국내 데이터센터 전력 수요 증가…AIDC 설계 기준 재정립 논의", summary: "AI 학습용 GPU 클러스터 도입이 늘면서 랙당 전력밀도와 냉각 방식에 대한 설계 기준 재검토가 필요하다는 지적이 나옵니다.", source: "산업 동향", date: "2026-07-22" },
  { category: "기술", title: "국산 AI반도체 기반 클라우드 실증 1단계 결과 공개", summary: "K-클라우드 프로젝트 1단계 실증에서 국산 NPU 기반 추론 서비스의 전력 효율 개선 결과가 보고됐습니다.", source: "산업 동향", date: "2026-07-08" },
  { category: "정책", title: "클라우드컴퓨팅법 하위법령 개정 논의 착수", summary: "보안인증 절차 간소화와 공공 이용 확대를 위한 하위법령 개정 논의가 시작됐습니다.", source: "산업 동향", date: "2026-06-19" },
  { category: "시장", title: "중견기업 클라우드 전환율 상승…비용 최적화가 최대 과제", summary: "전환 이후 운영비 관리를 위한 FinOps 도입 수요가 함께 늘어나는 것으로 조사됐습니다.", source: "산업 동향", date: "2026-06-02" },
  { category: "기술", title: "컨테이너 오케스트레이션 표준화 논의 재점화", summary: "멀티 클라우드 환경에서의 워크로드 이식성 확보를 위한 상호운용성 기준 논의가 이어지고 있습니다.", source: "산업 동향", date: "2026-05-21" },
];

export const TECH_TRENDS: NewsRow[] = [
  { category: "AI 인프라", title: "GPU 클러스터 스케줄링 최적화 동향", summary: "대규모 학습 작업의 대기시간을 줄이기 위한 우선순위 기반 스케줄러와 자원 분할 기법을 정리했습니다.", source: "기술동향 리포트 Vol.28", date: "2026-08-01" },
  { category: "데이터센터", title: "액침냉각 도입 현황과 국내 적용 과제", summary: "랙당 전력밀도 상승에 대응하기 위한 액침냉각 방식의 도입 사례와 국내 적용 시 검토 사항을 다룹니다.", source: "기술동향 리포트 Vol.27", date: "2026-06-28" },
  { category: "플랫폼", title: "쿠버네티스 멀티테넌시 구현 패턴 비교", summary: "네임스페이스 격리부터 가상 클러스터까지, 격리 수준별 구현 방식의 장단점을 비교했습니다.", source: "기술동향 리포트 Vol.26", date: "2026-05-15" },
  { category: "보안", title: "클라우드 네이티브 환경의 공급망 보안", summary: "컨테이너 이미지 서명과 SBOM 관리 체계를 중심으로 공급망 위협 대응 방안을 살펴봅니다.", source: "기술동향 리포트 Vol.25", date: "2026-04-03" },
  { category: "SaaS", title: "공공 SaaS 인증 준비 실무 가이드", summary: "CSAP 인증 준비 과정에서 자주 발생하는 미비 사항과 대응 방법을 정리했습니다.", source: "기술동향 리포트 Vol.24", date: "2026-02-27" },
  { category: "AI 인프라", title: "국산 NPU 소프트웨어 스택 성숙도 점검", summary: "컴파일러·런타임 계층의 지원 범위와 기존 프레임워크 호환성 현황을 점검했습니다.", source: "기술동향 리포트 Vol.23", date: "2026-01-16" },
];

export type Archive = {
  category: "법·제도" | "가이드라인" | "리포트" | "조합자료";
  title: string;
  fileType: "PDF" | "HWP" | "XLSX" | "ZIP";
  size: string;
  date: string;
};

export const ARCHIVES: Archive[] = [
  { category: "법·제도", title: "클라우드컴퓨팅법 시행 개정안 (2023.1.12 시행)", fileType: "PDF", size: "1.8MB", date: "2026-07-30" },
  { category: "가이드라인", title: "공공부문 SaaS 이용 가이드라인", fileType: "PDF", size: "4.2MB", date: "2026-07-12" },
  { category: "법·제도", title: "국가연구개발사업 연구개발비 사용기준 (2023 개정)", fileType: "HWP", size: "820KB", date: "2026-06-25" },
  { category: "리포트", title: "클라우드 기술동향 리포트 Vol.28 — AI 인프라 특집", fileType: "PDF", size: "6.5MB", date: "2026-06-01" },
  { category: "조합자료", title: "2026년 회원사 가입신청서 서식", fileType: "HWP", size: "120KB", date: "2026-05-20" },
  { category: "가이드라인", title: "『K-클라우드』 추진방안 요약본", fileType: "PDF", size: "2.1MB", date: "2026-04-18" },
  { category: "리포트", title: "국내 클라우드 산업 실태조사 결과", fileType: "XLSX", size: "1.1MB", date: "2026-03-07" },
  { category: "조합자료", title: "2025년도 사업 결과 보고서", fileType: "PDF", size: "3.4MB", date: "2026-02-14" },
];

export type Newsletter = {
  vol: string;
  title: string;
  topics: string[];
  date: string;
};

export const NEWSLETTERS: Newsletter[] = [
  { vol: "Vol.42", title: "AI 데이터센터, 설계 기준이 바뀐다", topics: ["AIDC 전력밀도", "액침냉각", "하반기 교육 일정"], date: "2026-08-01" },
  { vol: "Vol.41", title: "공공 SaaS 확산, 무엇이 달라지나", topics: ["SaaS 가이드라인", "CSAP 인증", "회원사 소식"], date: "2026-07-01" },
  { vol: "Vol.40", title: "국산 AI반도체 실증 중간 결과", topics: ["K-클라우드", "NPU 소프트웨어 스택", "정책 동향"], date: "2026-06-03" },
  { vol: "Vol.39", title: "멀티 클라우드 시대의 이식성", topics: ["오케스트레이션 표준", "FinOps", "분과위원회 활동"], date: "2026-05-02" },
];

/* ── 교육 ─────────────────────────────────────────── */

export const COURSES = [
  {
    title: "AIDC 인프라 설계·운영·최적화 실무",
    level: "심화",
    hours: "24시간 (3일)",
    target: "데이터센터 설계·운영 담당자",
    topics: ["전력·냉각 설계", "네트워크 토폴로지", "GPU 클러스터 운영", "모니터링 체계"],
    status: "접수중",
  },
  {
    title: "GPU 프로그래밍 모델 및 최적화",
    level: "심화",
    hours: "32시간 (4일)",
    target: "AI 인프라 엔지니어",
    topics: ["CUDA 프로그래밍 모델", "메모리 계층 최적화", "분산 학습", "프로파일링"],
    status: "접수중",
  },
  {
    title: "클라우드컴퓨팅 전문기술 연간교육",
    level: "기본",
    hours: "48시간 (연 6회)",
    target: "회원사 실무 인력 전반",
    topics: ["가상화 기초", "컨테이너·쿠버네티스", "클라우드 보안", "비용 최적화"],
    status: "상시",
  },
  {
    title: "기업연계형 AI 서비스·클라우드 실무",
    level: "기본",
    hours: "480시간",
    target: "취업 준비생 및 전직자",
    topics: ["클라우드 기초", "백엔드 개발", "MLOps", "기업 연계 프로젝트"],
    status: "모집중",
  },
];
