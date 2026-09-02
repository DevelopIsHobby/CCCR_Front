import "server-only";
import type { Driver } from "./driver";
import { sqliteDriver } from "./drivers/sqlite";
import { postgresDriver } from "./drivers/postgres";

/*
  쓸 드라이버를 고른다.
  - 운영: DATABASE_URL 에 postgres 주소를 넣으면 그것만으로 PostgreSQL 을 쓴다.
  - 로컬 개발: 아무것도 없으면 sqlite (설치할 것이 없다)

  DB_DRIVER 로 못박을 수도 있지만, 없어도 되게 해 두었다.
  관리형 호스팅은 DATABASE_URL 만 자동으로 넣어 주는 곳이 많은데,
  그때 DB_DRIVER 를 빠뜨리면 조용히 sqlite 로 떨어져 디스크에 쓰려다 죽는다.
  주소가 postgres 면 의도는 하나뿐이므로 그대로 따른다.
*/
export function driver(): Driver {
  const explicit = process.env.DB_DRIVER?.trim().toLowerCase();

  if (explicit) {
    switch (explicit) {
      case "sqlite":
        return sqliteDriver;
      case "postgres":
      case "postgresql":
        return postgresDriver;
      default:
        throw new Error(`지원하지 않는 DB_DRIVER: ${process.env.DB_DRIVER}`);
    }
  }

  if (/^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL ?? "")) {
    return postgresDriver;
  }

  return sqliteDriver;
}
