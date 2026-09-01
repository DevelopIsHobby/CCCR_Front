"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminSection } from "@/lib/admin-nav";

/** 관리자 화면 탭. 아직 만들지 않은 곳은 눌리지 않게 둔다. */
export default function AdminNav({ sections }: { sections: AdminSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            /* 하위 화면(연혁 관리 등)에서도 그 묶음이 켜져 있어야 한다 */
            const active =
              pathname === section.href || pathname.startsWith(`${section.href}/`);

            if (!section.ready) {
              return (
                <li key={section.href} className="shrink-0">
                  <span
                    title="준비 중입니다"
                    className="flex h-14 cursor-not-allowed items-center gap-1.5 px-4 text-md font-semibold text-ink-400/60"
                  >
                    {section.label}
                    <span className="rounded bg-surface px-1.5 py-0.5 text-2xs font-bold text-ink-400">
                      준비 중
                    </span>
                  </span>
                </li>
              );
            }

            return (
              <li key={section.href} className="shrink-0">
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-14 items-center px-4 text-md font-semibold transition-colors ${
                    active ? "text-navy-900" : "text-ink-600 hover:text-brand-600"
                  }`}
                >
                  {section.label}
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-flame-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
