import { SocialIcon } from "@/components/SocialIcons";
import { enabledProviders } from "@/lib/auth/social";
import { SOCIAL_LABEL, type SocialProvider } from "@/lib/auth/social-profile";

/*
  소셜 로그인 단추. 서버에 키가 들어간 서비스만 나온다. 하나도 없으면 아무것도 그리지 않는다.

  색·아이콘은 각 서비스의 로그인 버튼 안내를 따른다.
  - 카카오: 노랑 바탕(#FEE500), 검은 말풍선, 글자는 검정 85%
  - 네이버: 초록 바탕(#03C75A), 흰 N
  - 구글: 흰 바탕, 회색 테두리, 네 가지 색 G
  아이콘은 왼쪽에 붙이고 글자는 가운데에 둔다. 세 단추의 글자가 같은 줄에 선다.

  서버 경로(/api/auth/…)를 거쳐 바깥 서비스로 나가므로 Link 가 아니라 a 로 둔다.
  Link 는 미리 불러오기를 해 로그인 시작이 저절로 돌 수 있다.
*/
const STYLE: Record<SocialProvider, { button: string; icon: string }> = {
  kakao: { button: "bg-[#FEE500] text-black/85 hover:bg-[#F5DC00]", icon: "text-black" },
  naver: { button: "bg-[#03C75A] text-white hover:bg-[#02B350]", icon: "text-white" },
  google: {
    button: "border border-[#DADCE0] bg-white text-[#1F1F1F] hover:bg-[#F8F9FA]",
    icon: "",
  },
};

export default function SocialLoginButtons({
  next = "/",
  verb = "로그인",
  heading = "간편 로그인",
}: {
  next?: string;
  verb?: "로그인" | "가입";
  heading?: string;
}) {
  const providers = enabledProviders();
  if (providers.length === 0) return null;

  return (
    <section aria-label={heading} className="mt-8">
      <p className="flex items-center gap-4 text-sm font-medium text-ink-400 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        {heading}
      </p>

      <div className="mt-5 space-y-2.5">
        {providers.map((provider) => (
          <a
            key={provider}
            href={`/api/auth/${provider}?next=${encodeURIComponent(next)}`}
            className={`relative flex h-[52px] w-full items-center justify-center rounded-md px-12 text-md font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${STYLE[provider].button}`}
          >
            <SocialIcon
              provider={provider}
              className={`absolute left-4 size-5 ${STYLE[provider].icon}`}
            />
            {SOCIAL_LABEL[provider]}로 {verb}
          </a>
        ))}
      </div>
    </section>
  );
}
