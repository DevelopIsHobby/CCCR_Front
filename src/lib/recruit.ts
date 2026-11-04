/*
  강사 모집 안내. 게시판도 따로 화면도 없이 상시 모집하고, 이력서는 담당자 메일로 받는다(사무국 결정).

  메인 참여하기와 참여 안내 화면의 강사 모집 칸이 같은 팝업(RecruitDialog)을 연다.
  주소나 문구를 고칠 때는 여기 한 곳만 고친다. 말투는 부탁하지 않고 알린다.
*/
export const RECRUIT_EMAIL = "mskim@cccr.or.kr";

export const RECRUIT_TITLE = "강사 상시 모집";

/** 카드에 쓰는 한 줄 */
export const RECRUIT_SUMMARY = "클라우드·AI 교육과정과 세미나 강사를 상시 모집합니다.";

/** 팝업 안내 */
export const RECRUIT_NOTE = "조합 교육·세미나 강사를 상시 모집합니다. 이력서는 아래 메일로 받습니다.";

/** 메일 보내기 단추. 제목 머리를 미리 채워 받는 쪽에서 가려 보기 쉽게 한다 */
export const RECRUIT_MAILTO = `mailto:${RECRUIT_EMAIL}?subject=${encodeURIComponent("[강사 지원] ")}`;
