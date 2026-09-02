/*
  관리자 화면 구성.
  왼쪽 사이드바의 묶음·차례가 여기서 정해진다. 만들어 둔 곳만 링크가 걸리고,
  아직인 곳은 '준비 중'으로 표시한다.
*/
import type { AdminIconName } from "@/components/admin/AdminIcons";

export type AdminLink = {
  href: string;
  label: string;
  desc: string;
  ready: boolean;
  icon: AdminIconName;
  /** 사이드바에 따로 줄을 두지 않는 하위 화면들. 열려 있으면 부모가 켜진다. */
  children?: { href: string; label: string }[];
  /** 처리할 일 개수를 사이드바에 붙일 때 쓰는 이름 */
  badge?: "pendingMembers" | "newProposals" | "roomRequests" | "newPromos" | "pendingNotices";
};

export type AdminGroup = {
  id: string;
  label: string;
  links: AdminLink[];
};

/** 사이드바 맨 위. 묶음에 넣지 않고 혼자 둔다. */
export const ADMIN_DASHBOARD: AdminLink = {
  href: "/admin",
  label: "대시보드",
  desc: "오늘 현황 한눈에 보기",
  ready: true,
  icon: "gauge",
};

export const ADMIN_GROUPS: AdminGroup[] = [
  {
    id: "content",
    label: "콘텐츠",
    links: [
      { href: "/admin/home", label: "메인 화면", desc: "슬라이드·배너·알림판", ready: true, icon: "layout" },
      { href: "/admin/posts", label: "게시글 관리", desc: "전체 게시판 글 모아보기", ready: true, icon: "doc" },
      {
        href: "/admin/pages",
        label: "소개 페이지",
        desc: "인사말·설립목적·조직도",
        ready: true,
        icon: "book",
        children: [{ href: "/admin/pages/history", label: "연혁 관리" }],
      },
    ],
  },
  {
    id: "people",
    label: "회원 · 회원사",
    links: [
      {
        href: "/admin/members",
        label: "회원 관리",
        desc: "가입 승인·권한·탈퇴",
        ready: true,
        icon: "users",
        badge: "pendingMembers",
      },
      { href: "/admin/companies", label: "회원사 명단", desc: "회원사 추가·수정", ready: true, icon: "building" },
      { href: "/admin/newsletter", label: "뉴스레터", desc: "구독자 목록", ready: true, icon: "mail" },
      {
        href: "/admin/notices",
        label: "사업공고 수신자",
        desc: "임원사 주간 공고 명단",
        ready: true,
        icon: "mail",
        badge: "pendingNotices",
      },
      {
        href: "/admin/rooms",
        label: "회의실 예약",
        desc: "대회의실·소회의실 대여",
        ready: true,
        icon: "calendar",
        badge: "roomRequests",
      },
      {
        href: "/admin/promos",
        label: "홍보 신청",
        desc: "제품·행사 홍보 요청",
        ready: true,
        icon: "megaphone",
        badge: "newPromos",
      },
      {
        href: "/admin/proposals",
        label: "교육사업 제안",
        desc: "밖에서 들어온 협력 제안",
        ready: true,
        icon: "doc",
        badge: "newProposals",
      },
    ],
  },
  {
    id: "site",
    label: "사이트 운영",
    links: [
      { href: "/admin/site", label: "사이트 정보", desc: "주소·연락처·대표자", ready: true, icon: "globe" },
      { href: "/admin/files", label: "파일 관리", desc: "첨부·이미지 정리", ready: true, icon: "folder" },
      { href: "/admin/stats", label: "접속 통계", desc: "방문자·인기 게시물", ready: true, icon: "chart" },
    ],
  },
  {
    id: "account",
    label: "내 계정",
    links: [
      { href: "/admin/account", label: "계정 보안", desc: "비밀번호 변경", ready: true, icon: "shield" },
    ],
  },
];

/** 대시보드까지 포함한 평평한 목록 */
export const ADMIN_LINKS: AdminLink[] = [
  ADMIN_DASHBOARD,
  ...ADMIN_GROUPS.flatMap((g) => g.links),
];

/**
  지금 보고 있는 주소가 어느 항목인지 찾는다.
  하위 화면(연혁 관리 등)은 부모 항목으로 접힌다. '/admin' 은 정확히 같을 때만 잡는다.
*/
export function findAdminLink(pathname: string): AdminLink | null {
  const exact = ADMIN_LINKS.find((l) => l.href === pathname);
  if (exact) return exact;

  return (
    ADMIN_LINKS.find(
      (l) => l.href !== "/admin" && pathname.startsWith(`${l.href}/`),
    ) ?? null
  );
}

/** 하위 화면일 때 사이드바에 함께 보여 줄 이름 */
export function findAdminChild(pathname: string): { href: string; label: string } | null {
  for (const link of ADMIN_LINKS) {
    const hit = link.children?.find((c) => c.href === pathname);
    if (hit) return hit;
  }
  return null;
}
