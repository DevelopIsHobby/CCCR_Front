"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordAdminView } from "@/lib/db/admin-access-actions";

/*
  관리자 화면을 열 때마다 접속 기록('조회')을 남긴다.
  레이아웃은 지금 주소를 모르므로, 주소를 아는 브라우저 쪽에서 알린다.
  검색·쪽 넘김(?q=, ?page=)도 무엇을 봤는지에 들어가므로 함께 적는다.
*/
export default function AdminAccessLogger() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (!pathname) return;
    void recordAdminView(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);

  return null;
}
