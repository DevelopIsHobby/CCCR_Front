import { SocialIcon } from "@/components/SocialIcons";
import { enabledProviders } from "@/lib/auth/social";
import { SOCIAL_LABEL } from "@/lib/auth/social-profile";
import { SOCIAL_BUTTON, SOCIAL_BUTTON_BASE } from "@/components/social-style";

/*
  소셜 로그인 단추. 서버에 키가 들어간 서비스만 나온다. 하나도 없으면 아무것도 그리지 않는다.

  모양은 social-style.ts 에 둔다. 가입 2단계의 단추도 같은 모양을 쓴다.

  서버 경로(/api/auth/…)를 거쳐 바깥 서비스로 나가므로 Link 가 아니라 a 로 둔다.
  Link 는 미리 불러오기를 해 로그인 시작이 저절로 돌 수 있다.
*/
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
            className={`${SOCIAL_BUTTON_BASE} ${SOCIAL_BUTTON[provider].button}`}
          >
            <SocialIcon
              provider={provider}
              className={`absolute left-4 size-5 ${SOCIAL_BUTTON[provider].icon}`}
            />
            {SOCIAL_LABEL[provider]}로 {verb}
          </a>
        ))}
      </div>
    </section>
  );
}
