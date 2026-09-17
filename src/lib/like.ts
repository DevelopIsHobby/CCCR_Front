/*
  LIKE 로 '이 글자가 들어 있는지' 찾을 때 쓰는 검색어.

  %·_ 는 LIKE 에서 '아무 글자'라는 뜻이라, 그대로 넘기면 '%' 를 검색했을 때 모든 글이 걸리고
  '_' 는 아무 한 글자에 걸린다. 앞에 \ 를 붙여 글자 그대로 찾게 한다.
  쿼리에는 `LIKE ? ESCAPE '\'` 를 함께 쓴다(SQLite·PostgreSQL 공통).

  소문자로 낮춰서 돌려준다. SQLite 의 LIKE 는 영문 대소문자를 가리지 않지만 PostgreSQL 은
  가린다. 그대로 두면 DB 를 옮기는 순간 'cccr' 로 '[CCCR]' 을 찾지 못하게 된다.
  쿼리에서도 반드시 `LOWER(칸) LIKE ?` 로 짝을 맞춘다. 한쪽만 낮추면 아무것도 안 걸린다.
  DB·서버 전용 코드를 부르지 않아 검사에서 바로 불러 쓸 수 있다.
*/
export function likeContains(term: string): string {
  const escaped = term.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${escaped}%`;
}
