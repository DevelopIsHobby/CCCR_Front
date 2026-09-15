import type { SocialProvider } from "@/lib/auth/social-profile";

/*
  카카오·네이버·구글 로그인 아이콘.
  각 서비스의 로그인 버튼 안내에 맞춘 모양이다. 색은 버튼 쪽에서 정하고,
  구글 G 만 네 가지 색이 정해져 있어 여기서 칠한다.
*/

function KakaoSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 3.2c-5.3 0-9.6 3.37-9.6 7.52 0 2.68 1.79 5.03 4.48 6.36-.2.73-.72 2.65-.83 3.06-.13.51.19.5.39.37.16-.11 2.55-1.73 3.58-2.43.64.09 1.3.14 1.98.14 5.3 0 9.6-3.37 9.6-7.5S17.3 3.2 12 3.2z"
      />
    </svg>
  );
}

function NaverSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M15.56 12.72 8.2 2H2v20h6.44V11.28L15.8 22H22V2h-6.44z" />
    </svg>
  );
}

function GoogleSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function SocialIcon({ provider, className }: { provider: SocialProvider; className?: string }) {
  if (provider === "kakao") return <KakaoSymbol className={className} />;
  if (provider === "naver") return <NaverSymbol className={className} />;
  return <GoogleSymbol className={className} />;
}
