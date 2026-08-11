# C3R 홈페이지 리뉴얼 (Front)

한국클라우드컴퓨팅연구조합(C3R) 홈페이지 프론트엔드. Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript.

```bash
npm run dev
```

http://localhost:3000

## 디자인 시스템

토큰은 `src/app/globals.css`의 `@theme` 블록에 정의되어 있습니다. Tailwind 클래스에서 `bg-navy-900`, `text-brand-600` 처럼 바로 씁니다.

| 역할 | 토큰 | 값 |
| --- | --- | --- |
| 히어로·푸터 배경 | `navy-900` | `#062A55` |
| 주요 액션·링크 | `brand-600` | `#1257A5` |
| 액센트 (활성 탭, NEW, TOP) | `flame-500` | `#F05A28` |
| 섹션 배경 | `surface` | `#F5F8FC` |
| 본문 텍스트 | `ink-900` | `#14202E` |
| 구분선 | `line` | `#E2E8F0` |

- **본문/제목**: Pretendard Variable (CDN). 국문 제목은 `letter-spacing: -0.03em` 적용.
- **라벨/날짜/번호**: IBM Plex Mono. `label-mono` 유틸리티 클래스로 사용.
- **`hex-field`**: 히어로·알림판 배경의 육각 네트워크 패턴 유틸리티.

## 구조

```
src/
├── app/
│   ├── globals.css        # 디자인 토큰, 커스텀 유틸리티
│   ├── layout.tsx         # 폰트, 메타데이터, Header/Footer 공통 배치
│   ├── page.tsx           # 메인
│   ├── not-found.tsx      # 404
│   ├── about/             # 조합소개 (인사말·연혁·조직도·오시는길)
│   ├── members/           # 회원사안내 (현황·가입안내)
│   ├── business/          # 사업안내 (필요성·주요사업)
│   ├── board/             # 게시판 (공지사항·행사정보)
│   ├── info/              # 정보서비스 (산업뉴스·기술동향·자료실·뉴스레터)
│   ├── education/         # 교육과정
│   ├── login, signup/     # 회원
│   └── privacy, terms, email-policy, en/
├── components/
│   ├── Header.tsx         # 유틸리티바 + GNB + 메가메뉴 + 모바일 드로어
│   ├── Hero.tsx           # 슬라이더 + 신청·바로가기 패널
│   ├── NewsSection.tsx    # 새소식 탭 목록 + 알림판
│   ├── BannerRail.tsx     # 정책·자료 카드 캐러셀
│   ├── Partners.tsx       # 유관기관 로고 띠
│   ├── NewsletterBand.tsx # 푸터 상단 구독 밴드
│   ├── Footer.tsx         # 사이트맵 + 기관 정보
│   ├── Logo.tsx, Icons.tsx, ScrollTop.tsx
│   └── sub/
│       ├── PageShell.tsx  # 서브페이지 공통 셸 (breadcrumb + 타이틀 + 형제탭)
│       ├── Ui.tsx         # SectionHeading, DefTable, StepFlow, Pagination 등
│       └── LegalDoc.tsx   # 약관·방침 문서 레이아웃
└── lib/
    ├── site-data.ts       # 메뉴·메인 게시물·배너
    └── page-data.ts       # 서브페이지 콘텐츠
```

서브페이지를 추가할 때는 `PageShell`에 `href`만 넘기면 `site-data.ts`의 `NAV`에서 대메뉴·형제 탭·breadcrumb을 자동으로 구성합니다.

## 남은 작업

- **실제 콘텐츠 교체 필요.** `page-data.ts`와 `site-data.ts`의 게시물·회원사·연혁·교육과정은 화면 구성을 위해 작성한 예시입니다.
- **자리표시자 값**: 푸터·오시는길의 주소/전화(`02-000-0000`), 이사장명(`홍길동`), 회비 금액(`000,000원`)은 실제 정보로 교체해야 합니다.
- **법무 검토 필요**: 개인정보처리방침·이용약관은 표준 문안이므로 시행 전 검토가 필요합니다.
- **이미지**: 회원사 로고, 유관기관 로고, 이사장 사진은 자리표시자입니다. 확보 후 `next/image`로 교체하세요.
- **지도**: 찾아오시는 길의 지도는 격자 배경 자리표시자입니다. 카카오/네이버 지도 API 연동이 필요합니다.
- **기능 연동**: 게시판 목록·검색·페이지네이션, 로그인/회원가입, 뉴스레터 구독은 UI만 구현되어 있습니다. API 연동이 필요합니다.
- **영문 페이지**: `/en`은 안내 페이지만 있습니다. 전체 번역은 별도 작업입니다.
