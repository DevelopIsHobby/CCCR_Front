# 소셜 로그인 설정 (카카오 · 네이버 · 구글)

각 서비스의 개발자 사이트에 앱을 등록하고, 받은 값을 서버 환경변수에 넣으면 그 서비스의
로그인 단추가 로그인·회원가입 화면에 나타납니다. 값이 없는 서비스는 단추가 나오지 않습니다.

소셜로 처음 들어온 사람은 이메일 가입과 똑같이 **소속·동의를 적고 승인 대기**로 들어갑니다.
사무국이 관리자 화면(회원 관리)에서 승인해야 로그인할 수 있고, 목록에 어느 소셜 계정인지 딱지가 붙습니다.

---

## 공통: 돌아올 주소(Redirect URI)

서비스에 **한 글자도 틀리지 않게** 등록해야 합니다. 쓰는 주소마다 모두 등록해 두세요.

| 서비스 | 새 홈페이지 주소 | 미리보기 주소(Vercel) |
| --- | --- | --- |
| 카카오 | `https://cccr.kr/api/auth/kakao/callback` | `https://cccr-front.vercel.app/api/auth/kakao/callback` |
| 네이버 | `https://cccr.kr/api/auth/naver/callback` | `https://cccr-front.vercel.app/api/auth/naver/callback` |
| 구글 | `https://cccr.kr/api/auth/google/callback` | `https://cccr-front.vercel.app/api/auth/google/callback` |

새 홈페이지는 **`cccr.kr`** 입니다(2026-09-23). 옛 홈페이지가 있는 `cccr.or.kr` 이 아닙니다.
메일 주소만 계속 `@cccr.or.kr` 을 씁니다.

주소 앞부분은 서버의 `SITE_URL` 을 따릅니다. 다른 주소(예: `www.` 가 붙은 주소)로 들어와 로그인 단추를 눌러도
먼저 `SITE_URL` 주소로 옮긴 뒤 시작하므로, 서비스에는 `SITE_URL` 주소만 등록하면 됩니다.

---

## 1. 카카오 — https://developers.kakao.com

1. 내 애플리케이션 > 애플리케이션 추가하기 (앱 이름: 한국클라우드컴퓨팅연구조합)
2. **앱 키**의 `REST API 키` → `KAKAO_CLIENT_ID`
3. 제품 설정 > 카카오 로그인 > **활성화 설정 ON**, **Redirect URI** 에 위 주소 등록
4. 제품 설정 > 카카오 로그인 > 보안 > **Client Secret 코드 생성, 활성화 상태 '사용함'** → `KAKAO_CLIENT_SECRET`
5. 제품 설정 > 카카오 로그인 > **동의항목**
   - 닉네임: 필수 동의
   - 카카오계정(이메일): 받으려면 **비즈 앱 전환(사업자 정보 등록)** 이 필요합니다.
     이메일을 못 받아도 가입은 됩니다. 가입 화면에서 이메일을 직접 적게 됩니다.
6. 앱 설정 > 플랫폼 > Web 에 사이트 도메인 등록 (미리보기 주소와 정식 주소 둘 다)

## 2. 네이버 — https://developers.naver.com

1. Application > 애플리케이션 등록, 사용 API: **네이버 로그인**
2. 제공 정보: **이메일 주소, 이름** (필수)
3. 로그인 오픈 API 서비스 환경: PC 웹 — Callback URL 에 위 주소 등록.
   서비스 URL 은 **지금 로그인해 보는 사이트 주소**로 둡니다(지금은 `https://cccr.kr`).
4. `Client ID` → `NAVER_CLIENT_ID`, `Client Secret` → `NAVER_CLIENT_SECRET`
5. 등록 직후에는 **개발 중 상태**라 등록한 관리자·테스터 아이디만 로그인됩니다.
   시험할 아이디는 **멤버관리 > 테스트 ID** 에 넣습니다. 등록하지 않은 아이디는 네이버 오류 화면에서 멈춥니다.
   누구나 쓰려면 내 애플리케이션 > 네이버 로그인 검수요청을 받아야 합니다(며칠 걸릴 수 있음).
   검수는 정식 주소로 옮기고 서비스 URL·Callback URL 을 정식 주소로 바꾼 뒤 요청합니다.

## 3. 구글 — https://console.cloud.google.com

1. 프로젝트 만들기 → API 및 서비스 > **OAuth 동의 화면**: User Type 외부, 앱 이름·지원 이메일·
   승인된 도메인(`cccr.kr`) 입력, 범위 `openid` `email` `profile`
2. API 및 서비스 > 사용자 인증 정보 > **OAuth 클라이언트 ID 만들기**: 유형 '웹 애플리케이션',
   **승인된 리디렉션 URI** 에 위 주소 등록
3. `클라이언트 ID` → `GOOGLE_CLIENT_ID`, `클라이언트 보안 비밀번호` → `GOOGLE_CLIENT_SECRET`
4. 동의 화면 게시 상태를 **프로덕션**으로 바꿔야 테스트 사용자 말고도 로그인됩니다.

---

## 환경변수

VPS 는 `/srv/c3r/app/.env.production`, Vercel 은 프로젝트 Settings > Environment Variables 에 넣습니다.

```
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

넣은 뒤 서비스를 다시 시작합니다(VPS: `sudo systemctl restart c3r`, Vercel: 다시 배포).
비밀값(SECRET)은 절대 git 에 올리지 마세요.

## 동작 요약

| 들어온 사람 | 처리 |
| --- | --- |
| 이미 이어 둔 소셜 계정 | 바로 로그인 (승인 대기·차단이면 까닭을 알림) |
| 이어 둔 적 없지만, 서비스가 확인해 준 이메일이 기존 회원과 같음 | 그 회원에 이어 붙이고 로그인 |
| 그 밖 | 소속·동의를 적는 가입 화면 → 승인 대기 |

- '확인된 이메일': 구글은 이메일 확인 표시가 있을 때, 카카오는 유효·확인 표시가 모두 있을 때,
  네이버는 확인 여부를 알려 주지 않아 `naver.com` 주소일 때만. 확인되지 않은 이메일로는 기존 회원에 잇지 않습니다(계정 가로채기 방지).
- 소셜로만 가입한 회원은 비밀번호가 없습니다. 필요하면 '비밀번호 찾기'로 만들 수 있습니다.
- 가입 화면은 소셜 로그인 뒤 30분 안에 마쳐야 합니다.
