import { enabledProviders } from "@/lib/auth/social";
import { SOCIAL_LABEL, type SocialProvider } from "@/lib/auth/social-profile";

/*
  소셜 로그인 단추. 서버에 키가 들어간 서비스만 나온다. 하나도 없으면 아무것도 그리지 않는다.

  색은 각 서비스의 안내를 따른다(카카오 노랑·네이버 초록·구글 흰 바탕).
  서버 경로(/api/auth/…)를 거쳐 바깥 서비스로 나가므로 Link 가 아니라 a 로 둔다.
  Link 는 미리 불러오기를 해 로그인 시작이 저절로 돌 수 있다.
*/
const STYLE: Record<SocialProvider, string> = {
  kakao: "bg-[#FEE500] text-[#191919] hover:brightness-95",
  naver: "bg-[#03C75A] text-white hover:brightness-95",
  google: "border border-line bg-white text-ink-900 hover:bg-surface",
};

export default function SocialLoginButtons({
  next = "/",
  verb = "로그인",
  heading = "또는",
}: {
  next?: string;
  verb?: "로그인" | "가입";
  heading?: string;
}) {
  const providers = enabledProviders();
  if (providers.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="flex items-center gap-3 text-sm text-ink-400 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        {heading}
      </p>
      <div className="mt-4 space-y-2.5">
        {providers.map((provider) => (
          <a
            key={provider}
            href={`/api/auth/${provider}?next=${encodeURIComponent(next)}`}
            className={`flex w-full items-center justify-center rounded-md py-3.5 text-md font-bold transition ${STYLE[provider]}`}
          >
            {SOCIAL_LABEL[provider]}로 {verb}
          </a>
        ))}
      </div>
    </div>
  );
}
