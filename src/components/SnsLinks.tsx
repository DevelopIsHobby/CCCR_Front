import type { SiteSettings } from "@/lib/site-settings-types";

/*
  조합 SNS 단추.

  주소는 사이트 정보(site_settings)에서 온다. 계정이 바뀌어도 배포하지 않고
  관리자 화면에서 고칠 수 있다. 비어 있는 것은 아예 내보내지 않는다.

  아이콘은 각 서비스의 상표라 사이트의 선 아이콘 규칙(1.5 선)을 따르지 않고
  원래 모양(면)으로 그린다. 그래야 알아본다.
*/

const ICON_PATHS: Record<string, string> = {
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0",
  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0",
  facebook:
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07",
};

const SERVICES = [
  { key: "snsLinkedin" as const, icon: "linkedin", label: "링크드인" },
  { key: "snsInstagram" as const, icon: "instagram", label: "인스타그램" },
  { key: "snsFacebook" as const, icon: "facebook", label: "페이스북" },
];

export default function SnsLinks({
  site,
  tone = "dark",
  className = "",
}: {
  site: SiteSettings;
  /** dark: 짙은 푸터 위 · light: 밝은 유틸리티 바 위 */
  tone?: "dark" | "light";
  className?: string;
}) {
  const links = SERVICES.filter((s) => site[s.key]?.trim());
  if (links.length === 0) return null;

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map((s) => (
        <li key={s.key}>
          <a
            href={site[s.key]}
            target="_blank"
            rel="noreferrer"
            title={`조합 ${s.label} 새 창으로 열기`}
            className={
              tone === "light"
                ? "grid size-7 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white hover:text-brand-600"
                : "grid size-10 place-items-center rounded-full text-brand-100/70 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={tone === "light" ? "size-[15px]" : "size-[18px]"}
              aria-hidden
            >
              <path d={ICON_PATHS[s.icon]} />
            </svg>
            <span className="sr-only">{s.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
