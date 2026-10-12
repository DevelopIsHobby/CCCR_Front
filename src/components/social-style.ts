import type { SocialProvider } from "@/lib/auth/social-profile";

/*
  소셜 단추 모양. 로그인 화면(링크)과 가입 2단계(동의 폼의 제출 단추)가 함께 쓴다.
  서버 전용 코드를 부르지 않아 클라이언트 컴포넌트에서도 불러 쓸 수 있다.

  색·아이콘은 각 서비스의 로그인 버튼 안내를 따른다.
  - 카카오: 노랑 바탕(#FEE500), 검은 말풍선, 글자는 검정 85%
  - 네이버: 초록 바탕(#03C75A), 흰 N
  - 구글: 흰 바탕, 회색 테두리, 네 가지 색 G
  아이콘은 왼쪽에 붙이고 글자는 가운데에 둔다. 세 단추의 글자가 같은 줄에 선다.
*/
export const SOCIAL_BUTTON: Record<SocialProvider, { button: string; icon: string }> = {
  kakao: { button: "bg-[#FEE500] text-black/85 hover:bg-[#F5DC00]", icon: "text-black" },
  naver: { button: "bg-[#03C75A] text-white hover:bg-[#02B350]", icon: "text-white" },
  google: {
    button: "border border-[#DADCE0] bg-white text-[#1F1F1F] hover:bg-[#F8F9FA]",
    icon: "",
  },
};

export const SOCIAL_BUTTON_BASE =
  "relative flex h-[52px] w-full items-center justify-center rounded-md px-12 text-md font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
