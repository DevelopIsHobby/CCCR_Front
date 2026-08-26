import "server-only";
import type { Driver } from "./driver";
import { sqliteDriver } from "./drivers/sqlite";
import { postgresDriver } from "./drivers/postgres";

/*
  쓸 드라이버를 고른다.
  - 운영(국내 VPS): DB_DRIVER=postgres, DATABASE_URL=postgres://...
  - 로컬 개발: 기본값 sqlite (설치할 것이 없다)
*/
export function driver(): Driver {
  switch (process.env.DB_DRIVER ?? "sqlite") {
    case "sqlite":
      return sqliteDriver;
    case "postgres":
      return postgresDriver;
    default:
      throw new Error(`지원하지 않는 DB_DRIVER: ${process.env.DB_DRIVER}`);
  }
}
