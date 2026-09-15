"use client";

import { useEffect } from "react";

/*
  긴 신청서를 보내고 짧은 완료 화면으로 바뀌면 스크롤이 아래에 그대로 남아
  푸터만 보인다. 완료 화면이 나타날 때 맨 위로 올려 결과부터 읽히게 한다.
*/
export default function ScrollToTopOnShow() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  return null;
}
