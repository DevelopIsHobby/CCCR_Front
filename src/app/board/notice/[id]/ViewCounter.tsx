"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/lib/db/post-actions";

/*
  조회수는 화면이 실제로 열렸을 때만 센다.
  서버 렌더 중에 올리면 목록에서 링크를 프리페치하기만 해도 숫자가 올라간다.
*/
export default function ViewCounter({ postId }: { postId: number }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    void recordView(postId);
  }, [postId]);

  return null;
}
