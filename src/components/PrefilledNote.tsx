import type { Applicant } from "@/lib/applicant-types";

/*
  로그인 정보로 폼을 미리 채웠을 때 붙이는 알림.

  값이 아무 설명 없이 들어가 있으면 어디서 온 것인지 몰라 저절로 생긴 것처럼
  보인다. 어디서 가져왔고 고쳐도 된다는 것을 분명히 한다.
  담당자나 받을 주소를 다르게 적는 경우가 흔하기 때문이다.
*/
export default function PrefilledNote({ me }: { me: Applicant }) {
  const filled = Boolean(me.name || me.email || me.org);
  if (!filled) return null;

  return (
    <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-base leading-relaxed text-brand-700">
      로그인하신 계정 정보로 미리 채웠습니다. 다른 담당자나 다른 주소로 신청하시려면 그대로
      고쳐 주세요.
    </p>
  );
}
