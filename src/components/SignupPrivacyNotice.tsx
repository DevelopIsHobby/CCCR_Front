import { RETENTION_DAYS } from "@/lib/retention";

/*
  회원가입 동의 바로 아래에 붙는 안내.

  「개인정보 보호법」 제15조제2항: 동의를 받을 때는 ① 수집·이용 목적 ② 수집 항목
  ③ 보유·이용 기간 ④ 동의를 거부할 권리와 거부할 때의 불이익을 알려야 한다.
  신청 화면들은 ConsentCheck 가 이 네 가지를 보여 주는데, 회원가입은 '전문보기'뿐이었다.
  방침 전문은 길어서 무엇에 동의하는지 한눈에 보이지 않으므로 따로 적는다.

  항목·기간은 개인정보 처리방침 제2조·제3조와 같아야 한다(legal-data.ts).
*/
export default function SignupPrivacyNotice({ social = false }: { social?: boolean }) {
  const pendingMonths = Math.round(RETENTION_DAYS.pendingMember / 30);

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-line px-5 py-4 text-sm leading-relaxed text-ink-600">
      <div>
        <p className="font-bold text-navy-900">개인정보 수집·이용 동의 (필수)</p>
        <ul className="mt-1.5 space-y-0.5">
          <li>
            수집 항목 : 기관·회사명, 담당자 이름, 이메일주소
            {social ? ", 소셜 로그인 서비스의 회원 식별값" : ", 비밀번호"} (선택: 부서·직위, 연락처)
          </li>
          <li>이용 목적 : 회원 확인, 가입 승인, 회원 전용 자료 제공, 신청 진행 상황 안내</li>
          <li>
            보유 기간 : 회원 탈퇴 시까지 (승인되지 않은 신청은 {pendingMonths}개월 뒤 파기)
          </li>
          <li>동의를 거부하실 수 있으나, 그 경우 회원가입을 할 수 없습니다.</li>
        </ul>
      </div>
      <div>
        <p className="font-bold text-navy-900">뉴스레터 수신 동의 (선택)</p>
        <ul className="mt-1.5 space-y-0.5">
          <li>수집 항목 : 이메일주소 · 이용 목적 : 뉴스레터 발송</li>
          <li>보유 기간 : 구독 해지 시까지 (해지 후 30일 이내 파기)</li>
          <li>동의하지 않아도 가입할 수 있으며, 마이페이지에서 언제든지 끌 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
