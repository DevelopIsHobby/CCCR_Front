# C3R 홈페이지 리뉴얼 (Front)

한국클라우드컴퓨팅연구조합(C3R) 홈페이지 프론트엔드. Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript.

```bash
npm run dev
```

http://localhost:3000

## 게시판 · 로그인 (데이터베이스)

게시판과 로그인은 SQLite 파일 하나로 동작합니다. 별도 DB 서버를 설치할 필요가 없고,
드라이버도 Node 내장 `node:sqlite` 라서 네이티브 빌드가 없습니다. **Node 22 이상**이 필요합니다.

첫 실행 전에 관리자 계정을 만듭니다. 스키마는 이때 자동으로 생성됩니다.

```bash
node scripts/create-admin.mjs admin@cccr.or.kr "비밀번호" "최고관리자"
```

**로컬 개발은 SQLite, 운영 서버는 PostgreSQL**을 씁니다. 같은 코드가 두 방언 모두에서 동작하며,
어느 쪽을 쓸지는 `DB_DRIVER` 하나로 정합니다.

| 환경변수 | 기본값 | 설명 |
| --- | --- | --- |
| `DB_DRIVER` | `sqlite` | `sqlite` 또는 `postgres` |
| `DATABASE_PATH` | `data/c3r.db` | (sqlite) 파일 경로 |
| `DATABASE_URL` | — | (postgres) `postgres://user:pw@host:5432/c3r` |
| `DATABASE_SSL` | — | `1`이면 TLS로 접속 |
| `UPLOAD_DIR` | `data/uploads` | 첨부파일 저장 폴더 |

`data/`는 `.gitignore`에 있습니다. **OneDrive·Dropbox 같은 동기화 폴더 안에 두면 파일 잠금 때문에
쓰기가 실패할 수 있으므로**, 운영 서버에서는 동기화 밖 경로를 `DATABASE_PATH`로 지정하세요.

- 스키마는 `src/lib/db/migrations/<방언>/*.sql`을 이름순으로 한 번씩 적용합니다. 바꿀 때는 기존 파일을 고치지 말고 `002_*.sql`을 추가하세요.
- 비밀번호는 `node:crypto`의 scrypt로 해시하며(`scrypt$salt$hash`), 세션은 DB에 해시만 저장하고 쿠키에는 원문 토큰을 httpOnly로 내려보냅니다.
- 첨부파일은 `public/`이 아니라 `data/uploads`에 두고 `/api/attachments/[id]`에서 권한을 확인한 뒤 내보냅니다. 회원 전용 글의 첨부는 비로그인 시 403입니다.
- 헤더가 로그인 상태를 표시하므로 루트 레이아웃에서 쿠키를 읽습니다. 그래서 모든 페이지가 요청 시 렌더링(SSR)됩니다.

### 두 방언을 함께 유지하는 규칙

`src/lib/db/drivers/`의 SQLite·PostgreSQL 구현이 같은 `Driver` 인터페이스(`src/lib/db/driver.ts`)를 따릅니다.
쿼리를 새로 쓸 때 아래만 지키면 두 방언에서 똑같이 동작합니다.

- 자리표시자는 `?`만 씁니다. PostgreSQL 드라이버가 `$1, $2 …`로 바꿉니다. (SQL 문자열 리터럴 안에는 `?`를 쓰지 않습니다.)
- `datetime('now')` 같은 방언 함수 대신 `now()`(`src/lib/db/driver.ts`)로 앱에서 시각을 넣습니다.
- 새 행의 id는 `RETURNING id`로 받습니다.
- 참/거짓은 0/1 정수 컬럼으로 두고 `= 1`로 비교합니다.
- 스키마를 바꾸면 `migrations/sqlite/`와 `migrations/postgres/` **양쪽에** 같은 번호의 파일을 추가합니다.

## 서버 배포

국내 VPS(우분투) 기준 설치·배포·백업·복구 절차는 **[docs/deploy.md](docs/deploy.md)** 에 정리되어 있습니다.
관련 파일:

- `deploy/c3r.service` — systemd 서비스 (자동 재시작, 부팅 시 시작)
- `deploy/nginx.conf` — 리버스 프록시, 업로드 25MB 허용, 정적 자원 캐시
- `scripts/deploy.sh` — 코드 받기 → 빌드 → 재시작 → 상태 확인
- `scripts/backup.sh` — DB 덤프 + 첨부파일 백업, 30일치 보관

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

### 타이포그래피

임의 크기(`text-[0.9rem]`)를 쓰지 말고 아래 스케일만 사용합니다. `@theme`의 `--text-*` 토큰으로 정의되어 있습니다.

| 클래스 | 크기 | 용도 |
| --- | --- | --- |
| `text-2xs` | 11px | 날짜·용량 등 데이터 라벨 |
| `text-xs` | 12px | 캡션 |
| `text-sm` | 13px | 보조 텍스트 |
| `text-base` | 14px | 버튼·폼 등 UI 기본 |
| `text-md` | 15px | 본문 |
| `text-lg` | 17px | 카드 제목 |
| `text-xl` | 20px | 소제목 |
| `text-2xl` | 24px | 섹션 제목 |
| `text-3xl` | 32px | 서브페이지 제목 |
| `text-4xl` | 44px | 메인 히어로 |

- **본문/제목**: Pretendard Variable (CDN). 국문 제목은 `letter-spacing: -0.03em` 적용.
- **`label-mono`**: IBM Plex Mono. 날짜·용량·Vol 번호 등 **라틴 숫자 데이터 전용**.
- **`data-line`**: 한글이 섞인 데이터 줄(건수·기간·등급). mono는 한글 글리프가 없어 자간이 어긋나므로 본문 서체를 씁니다.

### 장식에 대한 원칙

- **번호(01/02/03)는 실제 순서일 때만** 씁니다. 가입 절차·회원가입 단계처럼 순서가 정보를 담는 곳만 해당하며, 병렬 항목에는 쓰지 않습니다.
- **eyebrow는 장식이 아니라 데이터**입니다. 제목을 영어로 반복하지 말고 건수·기간·분류 같은 실제 값을 넣습니다. 가능하면 배열 길이에서 계산해 데이터와 어긋나지 않게 합니다.
- **`hex-field`(육각 패턴)는 메인 히어로에서만** 씁니다. 반복되면 텍스처가 벽지가 되어 히어로가 특별해 보이지 않습니다. 서브페이지 헤더는 하단 액센트 라인 한 줄로 대신합니다.

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
    ├── page-data.ts       # 서브페이지 콘텐츠 (정적 텍스트)
    ├── format.ts          # 날짜·용량 표시 포맷
    ├── uploads.ts         # 첨부파일 저장·삭제·확장자 차단
    ├── auth/
    │   ├── password.ts    # scrypt 해시·검증
    │   ├── session.ts     # 세션 발급·조회·삭제, requireAdmin
    │   └── actions.ts     # 로그인·로그아웃 서버 액션
    └── db/
        ├── client.ts      # SQLite 연결
        ├── migrate.ts     # 마이그레이션 러너
        ├── migrations/    # 스키마 SQL
        ├── posts.ts       # 게시글 조회 (목록·상세·이전다음)
        └── post-actions.ts# 글 등록·수정·삭제 서버 액션
```

서브페이지를 추가할 때는 `PageShell`에 `href`만 넘기면 `site-data.ts`의 `NAV`에서 대메뉴·형제 탭·breadcrumb을 자동으로 구성합니다.

## 남은 작업

- **실제 콘텐츠 교체 필요.** `page-data.ts`와 `site-data.ts`의 게시물·회원사·연혁·교육과정은 화면 구성을 위해 작성한 예시입니다.
- **반영 완료된 실제 정보**: 이사장(이동기), 설립연도(2009), 조직 구성(총회·이사회·이사장·감사·자문위원회·사무국 + 4개 팀), 부서별 연락처와 이메일(`cccr.or.kr`), 인사말 전문, 조합 표어, 사무실 2곳(삼성 사무실 / 구로 교육장)의 주소·전화·팩스·교통편.
- **아직 자리표시자**: 고유번호(`000-00-00000`), 행사정보·교육과정·정보서비스(산업뉴스·기술동향·자료실·뉴스레터) 목록.
- **연혁**: 2008년 창립총회부터 2023년까지 전 기간 실제 자료가 반영되어 있습니다(15개 연도, 249건). 연도를 추가하려면 `page-data.ts`의 `HISTORY` 배열에 넣으면 탭이 자동으로 늘어납니다.
- **원문 오타 그대로 옮긴 곳**: 구로 교육장 시내버스 안내의 "디지털산업1단지 정류장 하처"(→ 하차로 보임). `page-data.ts`의 `OFFICES`에서 수정할 수 있습니다.
- **인사말 본문의 "지난 10년간"**: 조합 공식 문구를 그대로 옮겼으나 2009년 설립 기준으로 작성 시점이 2019년경으로 보입니다. 현재 기준으로 갱신이 필요한지 확인이 필요합니다.
- **법무 검토 필요**: 개인정보처리방침·이용약관은 표준 문안이므로 시행 전 검토가 필요합니다.
- **이미지**: 회원사 로고, 유관기관 로고, 이사장 사진은 자리표시자입니다. (전달 예정) 확보 후 `next/image`로 교체하세요.
- **지도**: 찾아오시는 길의 지도는 격자 배경 자리표시자입니다. 카카오/네이버 지도 API 연동이 필요합니다.
- **공지사항은 DB로 동작합니다**: 목록·검색·페이지네이션·상세·이전다음글·조회수, 관리자 글쓰기/수정/삭제, 첨부파일 업로드·다운로드, 회원 전용 글 잠금까지 구현되어 있습니다. 기존 사이트의 과거 게시물은 이관하지 않았습니다.
- **아직 UI만 있는 기능**: 행사정보 게시판, 회원가입, 아이디 찾기·비밀번호 재설정, 뉴스레터 구독. 행사정보는 `boards` 테이블에 행이 이미 있으므로 공지사항 페이지를 본떠 붙이면 됩니다.
- **영문 페이지**: `/en`은 안내 페이지만 있습니다. 전체 번역은 별도 작업입니다.
