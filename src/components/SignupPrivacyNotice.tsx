import { RETENTION_DAYS } from "@/lib/retention";
import type { MemberType } from "@/lib/user-types";

/*
  회원 유형마다 받는 칸이 다르다(lib/auth/signup-profile.ts). 동의를 받을 때는 실제로
  받는 항목을 알려야 하므로 유형에 맞춰 적는다. 유형을 아직 모르면(소셜 로그인 단추로
  바로 온 경우) 두 유형을 모두 적는다.
*/
const ITEMS: Record<MemberType, { required: string; optional: string }> = {
  개인: { required: "회원 유형, 이름, 이메일주소, 휴대전화번호", optional: "소속" },
  기업: {
    required: "회원 유형, 기관·회사명, 담당자 이름, 이메일주소, 휴대전화번호",
    optional: "부서·직위, 사업자등록번호",
  },
};

/*
  회원가입 동의 바로 아래에 붙는 안내.

  「개인정보 보호법」 제15조제2항: 동의를 받을 때는 ① 수집·이용 목적 ② 수집 항목
  ③ 보유·이용 기간 ④ 동의를 거부할 권리와 거부할 때의 불이익을 알려야 한다.
  신청 화면들은 ConsentCheck 가 이 네 가지를 보여 주는데, 회원가입은 '전문보기'뿐이었다.
  방침 전문은 길어서 무엇에 동의하는지 한눈에 보이지 않으므로 따로 적는다.

  항목·기간은 개인정보 처리방침 제2조·제3조와 같아야 한다(legal-data.ts).
*/
export default function SignupPrivacyNotice({
  social = false,
  memberType,
}: {
  social?: boolean;
  memberType?: MemberType;
}) {
  const pendingMonths = Math.round(RETENTION_DAYS.pendingMember / 30);
  /* 이메일 가입은 비밀번호를, 소셜 가입은 그 서비스의 회원 식별값을 받는다 */
  const login = social ? "소셜 로그인 서비스의 회원 식별값" : "비밀번호";
  const line = (t: MemberType) =>
    `${ITEMS[t].required}, ${login} (선택: ${ITEMS[t].optional})`;

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-line px-5 py-4 text-sm leading-relaxed text-ink-600">
      <div>
        <p className="font-bold text-navy-900">개인정보 수집·이용 동의 (필수)</p>
        <ul className="mt-1.5 space-y-0.5">
          {memberType ? (
            <li>수집 항목 : {line(memberType)}</li>
          ) : (
            <>
              <li>수집 항목(개인회원) : {line("개인")}</li>
              <li>수집 항목(기업회원) : {line("기업")}</li>
            </>
          )}
          <li>
            이용 목적 : 회원 확인, 가입 승인, 회원 전용 자료 제공, 신청 진행 상황 안내,
            중복 가입 확인
          </li>
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
