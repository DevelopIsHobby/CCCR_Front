/*
  LIKE 로 '이 글자가 들어 있는지' 찾을 때 쓰는 검색어.

  %·_ 는 LIKE 에서 '아무 글자'라는 뜻이라, 그대로 넘기면 '%' 를 검색했을 때 모든 글이 걸리고
  '_' 는 아무 한 글자에 걸린다. 앞에 \ 를 붙여 글자 그대로 찾게 한다.
  쿼리에는 `LIKE ? ESCAPE '\'` 를 함께 쓴다(SQLite·PostgreSQL 공통).
  DB·서버 전용 코드를 부르지 않아 테스트에서 바로 불러 쓸 수 있다.
*/
export function likeContains(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
