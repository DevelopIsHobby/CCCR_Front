import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Driver, SqlValue } from "../driver";

/*
  SQLite 드라이버. Node 내장 node:sqlite 를 쓰므로 설치할 패키지가 없다.
  동기 API 지만 Driver 인터페이스에 맞춰 Promise 로 감싼다.

  경로를 환경변수로 정하므로 빌드할 때는 어디를 가리킬지 알 수 없다. 그대로 두면
  Next 가 "모르겠으니 다 넣자" 하고 프로젝트 전체(public 폴더까지)를 결과물에
  딸려 넣는다. 여기서 읽는 것은 서버가 돌 때 생기는 자료 파일이지 빌드에 넣을
  코드가 아니므로, 따라가지 말라고 표시해 둔다.
*/
const DB_PATH = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? "data/c3r.db");

let conn: DatabaseSync | null = null;

function connection(): DatabaseSync {
  if (conn) return conn;

  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  conn = db;
  return db;
}

export const sqliteDriver: Driver = {
  dialect: "sqlite",

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return connection().prepare(sql).all(...params) as unknown as T[];
  },

  async get<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
    return (connection().prepare(sql).get(...params) as unknown as T) ?? null;
  },

  async run(sql: string, params: SqlValue[] = []): Promise<void> {
    connection().prepare(sql).run(...params);
  },

  async exec(sql: string): Promise<void> {
    connection().exec(sql);
  },

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const db = connection();
    db.exec("BEGIN");
    try {
      const result = await fn();
      db.exec("COMMIT");
      return result;
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  },
};
