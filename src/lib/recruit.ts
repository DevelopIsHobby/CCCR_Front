/*
  강사 모집 안내. 게시판 없이 상시 모집하고, 이력서는 담당자 메일로 받는다(사무국 결정).

  메인 참여하기 팝업(RecruitDialog)과 참여하기 → 강사 모집 화면이 함께 쓴다.
  주소나 문구를 고칠 때는 여기 한 곳만 고친다.
*/
export const RECRUIT_EMAIL = "mskim@cccr.or.kr";

export const RECRUIT_NOTE =
  "조합 교육·세미나에서 강의해 주실 분을 상시 모집합니다. 이력서를 아래 메일로 보내 주세요.";

/** 메일 보내기 단추. 제목 머리를 미리 채워 받는 쪽에서 가려 보기 쉽게 한다 */
export const RECRUIT_MAILTO = `mailto:${RECRUIT_EMAIL}?subject=${encodeURIComponent("[강사 지원] ")}`;
