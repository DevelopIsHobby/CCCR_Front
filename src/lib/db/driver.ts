import "server-only";

/*
  DB 드라이버 인터페이스.

  SQL 은 이 인터페이스 뒤에서만 실행된다. 나중에 PostgreSQL 이나 MySQL 로 옮길 때는
  drivers/ 에 파일 하나를 더 만들고 아래 Driver 를 구현하면 되고,
  쿼리를 쓰는 쪽(posts.ts, session.ts 등)은 손대지 않는다.

  규칙
  - 자리표시자는 `?` 로만 쓴다. PostgreSQL 드라이버가 $1, $2 로 바꿔 준다.
  - `datetime('now')` 같은 방언 함수는 쿼리에 쓰지 않는다. 시각은 앱에서 넣는다.
  - 새 행의 id 는 `RETURNING id` 로 받는다. SQLite·PostgreSQL 모두 지원한다.
*/
export type SqlValue = string | number | null | Uint8Array;

export interface Driver {
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  get<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  /** 마이그레이션처럼 여러 문장을 한 번에 실행한다. */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  /** 마이그레이션 SQL 을 고를 때 쓰는 방언 이름 */
  readonly dialect: "sqlite" | "postgres";
}

/** DB 에 저장하는 시각 형식. 'YYYY-MM-DD HH:MM:SS' (UTC) */
export function now(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}
