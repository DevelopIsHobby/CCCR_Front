"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon, IconExternal } from "@/components/admin/AdminIcons";
import { IconChevron, IconClose, IconMenu } from "@/components/Icons";
import {
  ADMIN_DASHBOARD,
  ADMIN_GROUPS,
  findAdminChild,
  findAdminLink,
  type AdminLink,
} from "@/lib/admin-nav";
import { logout } from "@/lib/auth/actions";

export type AdminBadges = { pendingMembers: number; newProposals: number; roomRequests: number };

type Props = {
  name: string;
  email: string;
  badges: AdminBadges;
  children: React.ReactNode;
};

/*
  관리자 화면 껍데기. 왼쪽 사이드바 + 위쪽 막대 + 본문.
  사이드바는 PC 에선 늘 붙어 있고, 좁은 화면에선 서랍으로 열린다.
*/
export default function AdminShell({ name, email, badges, children }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  /* 접어 둔 묶음. 처음엔 모두 펴 둔다. */
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const current = findAdminLink(pathname);
  const child = findAdminChild(pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  /* 서랍에서 메뉴를 고르면 곧바로 닫는다. PC 사이드바에서는 이미 닫혀 있어 아무 일도 없다. */
  const closeDrawer = () => setDrawerOpen(false);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="관리자 메뉴">
      <NavItem
        link={ADMIN_DASHBOARD}
        active={pathname === "/admin"}
        badge={0}
        onNavigate={closeDrawer}
      />

      {ADMIN_GROUPS.map((group) => {
        const open = !collapsed.includes(group.id);
        return (
          <div key={group.id} className="mt-5 first:mt-4">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-bold tracking-wide text-ink-400 transition-colors hover:text-ink-600"
            >
              {group.label}
              <IconChevron
                className={`size-3.5 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
              />
            </button>

            {open && (
              <ul className="mt-1 space-y-0.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavItem
                      link={link}
                      active={current?.href === link.href}
                      badge={link.badge ? badges[link.badge] : 0}
                      onNavigate={closeDrawer}
                    />
                    {/* 지금 하위 화면에 있으면 그 이름을 아래에 덧붙인다 */}
                    {child && current?.href === link.href && (
                      <p className="ml-11 mt-0.5 flex items-center gap-1.5 py-1 text-sm font-semibold text-brand-600">
                        <span className="h-3 w-px bg-brand-200" />
                        {child.label}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="border-b border-line px-5 py-4">
      <p className="data-line text-flame-500">C3R ADMIN</p>
      <p className="mt-1 text-lg font-bold leading-tight text-navy-900">홈페이지 관리</p>
    </div>
  );

  const siteLink = (
    <div className="border-t border-line p-3">
      <Link
        href="/"
        target="_blank"
        className="flex items-center justify-center gap-2 rounded-lg border border-flame-500/40 bg-flame-100/40 px-4 py-2.5 text-base font-bold text-flame-700 transition-colors hover:bg-flame-100"
      >
        <IconExternal className="size-4" />
        홈페이지 바로가기
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="lg:flex">
        {/* 사이드바 — PC */}
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-line bg-white lg:flex">
          {brand}
          {nav}
          {siteLink}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* 위쪽 막대 */}
          <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-5 lg:px-8">
              <button
                type="button"
                aria-label="관리자 메뉴 열기"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-700 transition-colors hover:bg-surface lg:hidden"
              >
                <IconMenu className="size-[22px]" />
              </button>

              <div className="min-w-0 flex-1">
                {/* PC 는 사이드바가 위치를 알려 주므로 조합 이름을, 좁은 화면에선 지금 화면 이름을 둔다 */}
                <p className="truncate text-lg font-bold text-navy-900 max-lg:hidden">
                  한국클라우드컴퓨팅연구조합 <span className="text-ink-400">관리자</span>
                </p>
                <p className="truncate text-lg font-bold text-navy-900 lg:hidden">
                  {child?.label ?? current?.label ?? "관리자"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-base text-ink-600 sm:inline">
                  <b className="font-bold text-navy-900">{name}</b>님
                  <span className="ml-2 hidden text-sm text-ink-400 lg:inline">{email}</span>
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg border border-line px-3.5 py-2 text-base font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main
            id="admin-main"
            className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-8 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </div>
      </div>

      {/* 사이드바 — 좁은 화면 서랍 */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-navy-950/50 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[84%] max-w-[300px] flex-col bg-white transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line py-2 pl-5 pr-3">
            <div className="py-2">
              <p className="data-line text-flame-500">C3R ADMIN</p>
              <p className="mt-1 text-lg font-bold leading-tight text-navy-900">홈페이지 관리</p>
            </div>
            <button
              type="button"
              aria-label="관리자 메뉴 닫기"
              onClick={() => setDrawerOpen(false)}
              className="grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-surface"
            >
              <IconClose className="size-[22px]" />
            </button>
          </div>
          {nav}
          {siteLink}
        </div>
      </div>
    </div>
  );
}

function NavItem({
  link,
  active,
  badge,
  onNavigate,
}: {
  link: AdminLink;
  active: boolean;
  badge: number;
  onNavigate: () => void;
}) {
  if (!link.ready) {
    return (
      <span
        title="준비 중입니다"
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-ink-400/60"
      >
        <AdminIcon name={link.icon} className="size-[18px] shrink-0" />
        {link.label}
        <span className="ml-auto rounded bg-surface px-1.5 py-0.5 text-2xs font-bold text-ink-400">
          준비 중
        </span>
      </span>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold transition-colors ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-ink-600 hover:bg-surface hover:text-navy-900"
      }`}
    >
      <AdminIcon
        name={link.icon}
        className={`size-[18px] shrink-0 ${active ? "text-brand-600" : "text-ink-400"}`}
      />
      <span className="truncate">{link.label}</span>
      {badge > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-flame-500 px-1.5 py-0.5 text-2xs font-bold tabular-nums text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
