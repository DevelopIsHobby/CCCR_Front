/*
  관리자 화면 구성.
  만들어 둔 곳만 링크가 걸리고, 아직인 곳은 '준비 중'으로 표시한다.
*/
export type AdminSection = {
  href: string;
  label: string;
  desc: string;
  ready: boolean;
};

export const ADMIN_SECTIONS: AdminSection[] = [
  { href: "/admin/home", label: "메인 화면", desc: "슬라이드·배너·알림판", ready: true },
  { href: "/admin/members", label: "회원 관리", desc: "가입 승인·권한·탈퇴", ready: true },
  { href: "/admin/posts", label: "게시글 관리", desc: "전체 게시판 글 모아보기", ready: true },
  { href: "/admin/companies", label: "회원사 명단", desc: "회원사 추가·수정", ready: true },
  { href: "/admin/site", label: "사이트 정보", desc: "주소·연락처·대표자", ready: true },
  { href: "/admin/newsletter", label: "뉴스레터", desc: "구독자 목록", ready: true },
  { href: "/admin/files", label: "파일 관리", desc: "첨부·이미지 정리", ready: true },
  { href: "/admin/account", label: "계정 보안", desc: "비밀번호 변경", ready: true },
  { href: "/admin/pages", label: "소개 페이지", desc: "인사말·연혁·조직도", ready: true },
  { href: "/admin/stats", label: "접속 통계", desc: "방문자·인기 게시물", ready: false },
];
