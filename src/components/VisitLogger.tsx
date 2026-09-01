"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordVisit } from "@/lib/db/visit-actions";

/*
  접속 통계용. 화면이 열릴 때 한 번만 알린다.
  서버 렌더에서 세면 목록에서 링크를 미리 받아오기만 해도 숫자가 올라간다.
*/
export default function VisitLogger() {
  const pathname = usePathname();
  const last = useRef("");

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    void recordVisit(pathname);
  }, [pathname]);

  return null;
}
