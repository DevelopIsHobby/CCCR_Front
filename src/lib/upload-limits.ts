/*
  게시글 첨부 크기 기준(화면에서 미리 알려 줄 때 쓴다).

  서버는 한 번에 받는 요청을 25MB 에서 자른다(next.config.ts 의 serverActions.bodySizeLimit, deploy/nginx.conf).
  넘으면 저장을 눌렀을 때 까닭 모를 오류가 나므로, 파일을 고르는 순간 알려 주고 제출을 막는다.
  합계는 제목·본문 같은 다른 칸 몫을 남겨 24MB 로 잡는다.
  파일 하나의 한도는 서버의 uploads.ts MAX_UPLOAD_BYTES(20MB)와 같다.
  서버·DB 코드를 부르지 않아 화면(브라우저)과 테스트에서 함께 쓴다.
*/
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FILES_TOTAL_BYTES = 24 * 1024 * 1024;

/** 고른 파일이 한도를 넘으면 안내 문구를, 괜찮으면 빈 문자열을 돌려준다. */
export function checkAttachmentSizes(files: { name: string; size: number }[]): string {
  const big = files.find((f) => f.size > MAX_FILE_BYTES);
  if (big) return `'${big.name}' 은(는) 20MB 를 넘어 올릴 수 없습니다.`;

  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > MAX_FILES_TOTAL_BYTES) {
    return "한 번에 올리는 파일은 합쳐서 24MB 까지입니다. 나눠서 올려 주세요.";
  }
  return "";
}
