import Link from "next/link";
import { NAV } from "@/lib/site-data";
import { IconChevron } from "@/components/Icons";

type Props = {
  /** 현재 경로. NAV에서 대메뉴·형제메뉴를 자동으로 찾는다. */
  href: string;
  /** NAV에 없는 페이지(로그인, 약관 등)는 직접 지정 */
  title?: string;
  category?: string;
  desc?: string;
  children: React.ReactNode;
};

export default function PageShell({ href, title, category, desc, children }: Props) {
  const section = NAV.find((n) => href.startsWith(n.href));
  const child = section?.children.find((c) => c.href === href);

  const pageTitle = title ?? child?.label ?? section?.label ?? "";
  const pageCategory = category ?? section?.label ?? "";
  const siblings = section?.children ?? [];

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/60"
          aria-hidden
        />
        {/* 히어로의 텍스처 대신 얇은 액센트 한 줄만 둔다 */}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-flame-500" aria-hidden />

        <div className="relative mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
          <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-1.5">
            <Link href="/" className="text-sm text-brand-100/60 hover:text-white">
              홈
            </Link>
            {pageCategory && (
              <>
                <IconChevron className="size-3 text-brand-100/30" />
                <span className="text-sm text-brand-100/60">{pageCategory}</span>
              </>
            )}
            <IconChevron className="size-3 text-brand-100/30" />
            <span className="text-sm font-medium text-white">{pageTitle}</span>
          </nav>

          <h1 className="mt-7 text-2xl font-bold leading-tight text-white lg:text-3xl">
            {pageTitle}
          </h1>
          {desc && (
            <p className="mt-4 max-w-2xl text-md leading-relaxed text-brand-100/70">
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* 형제 메뉴 탭 */}
      {siblings.length > 1 && (
        <div className="border-b border-line bg-white">
          <div className="mx-auto max-w-[1280px] px-6">
            <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {siblings.map((s) => {
                const active = s.href === href;
                return (
                  <li key={s.href} className="shrink-0">
                    <Link
                      href={s.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-14 items-center px-5 text-md font-semibold transition-colors ${
                        active ? "text-navy-900" : "text-ink-400 hover:text-brand-600"
                      }`}
                    >
                      {s.label}
                      {active && (
                        <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-flame-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:py-20">{children}</div>
    </>
  );
}
