"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markSubscribersSeenAction } from "@/lib/db/newsletter-actions";

/*
  구독자 화면이 실제로 열렸을 때만 '새 구독을 봤다'고 적는다.

  화면을 그릴 때(서버) 적으면, 사이드바 링크가 이 화면을 미리 불러오기만 해도 적혀서
  관리자가 보지도 않은 새 구독 숫자가 사라졌다. 미리 불러오기는 이 효과를 돌리지 않는다.
  적은 뒤 사이드바 숫자를 지우려고 화면을 새로 받는다.
*/
export default function MarkSubscribersSeen() {
  const router = useRouter();
  useEffect(() => {
    void markSubscribersSeenAction().then(() => router.refresh());
  }, [router]);
  return null;
}
