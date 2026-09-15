/*
  글 본문에 걸린 그림 찾기 (관리자 '파일 관리').

  예전에는 그림 한 장마다 모든 글 본문을 LIKE 로 네 번씩 훑었다. 그림 100장·글 500개면
  본문 비교가 20만 번이라 글이 쌓일수록 화면이 몇 초씩 걸렸다. 또 '%/api/images/1%' 는
  11·12번 그림 주소에도 걸려서, 1번 그림이 실제로는 안 쓰여도 '사용 중' 으로 보였다.

  이제 그림 주소가 들어 있는 글만 한 번 읽어 여기서 번호를 정확히 뽑는다.
  DB·서버 전용 코드를 부르지 않아 테스트에서 바로 불러 쓸 수 있다.
*/

export type PostBody = { id: number; title: string; board: string; body: string | null };

export type ImageUse = {
  /** 이 그림을 쓴 글 수 */
  count: number;
  /** 그중 가장 최근 글(번호가 큰 글) */
  postId: number;
  title: string;
  board: string;
};

/* 숫자 뒤에 또 숫자가 이어지면 다른 그림이다(1 과 11 을 가른다) */
const IMAGE_URL = /\/api\/images\/(\d+)(?!\d)/g;

/** 그림 번호 → 쓰인 곳. 한 글에 같은 그림이 여러 번 있어도 한 번으로 센다. */
export function mapImageUses(posts: PostBody[]): Map<number, ImageUse> {
  const uses = new Map<number, ImageUse>();
  /* 최근 글이 대표로 보이도록 번호가 큰 글부터 본다 */
  const ordered = [...posts].sort((a, b) => b.id - a.id);

  for (const post of ordered) {
    if (!post.body) continue;
    const seen = new Set<number>();
    for (const match of post.body.matchAll(IMAGE_URL)) {
      const imageId = Number(match[1]);
      if (seen.has(imageId)) continue;
      seen.add(imageId);

      const found = uses.get(imageId);
      if (found) found.count += 1;
      else uses.set(imageId, { count: 1, postId: post.id, title: post.title, board: post.board });
    }
  }
  return uses;
}
