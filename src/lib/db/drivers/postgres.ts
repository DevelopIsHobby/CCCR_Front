import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";
import type { Driver, SqlValue } from "../driver";

/*
  PostgreSQL 드라이버.

  쿼리는 SQLite 와 같은 `?` 자리표시자로 쓰고 여기서 $1, $2 로 바꾼다.
  (SQL 문자열 리터럴 안에는 ? 를 쓰지 않는 것을 규칙으로 한다.)

  접속 정보는 DATABASE_URL 로 준다.
    postgres://사용자:비밀번호@호스트:5432/데이터베이스
*/
let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 이 필요합니다. (예: postgres://user:pw@localhost:5432/c3r)");
  }

  pool = new Pool({
    connectionString,
    /*
      서버리스에서는 함수 인스턴스마다 풀을 따로 잡는다. 인스턴스가 늘면
      커넥션이 금세 바닥나므로 기본값을 1 로 둔다. 디스크가 있는 서버는 10.
    */
    max: Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 10)),
    idleTimeoutMillis: 30_000,
    /* 관리형 DB 처럼 TLS 를 요구하는 곳을 위해 DATABASE_SSL=1 로 켠다.
       값이 없어도 주소에 sslmode=require 가 있으면 pg 가 알아서 TLS 를 쓴다. */
    ssl: process.env.DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined,
  });

  /*
    놀고 있는 커넥션이 끊기면 pg 가 Pool 에 'error' 를 쏜다. DB 를 다시 띄우거나
    (apt 업그레이드·백업) 네트워크가 잠깐 끊기면 놀던 커넥션이 한꺼번에 끊긴다.

    받는 곳이 없으면 Node 규칙대로 '잡히지 않은 예외'가 되어 서버가 그대로 죽는다.
    조회 한 번 실패로 끝날 일이 사이트 전체가 내려가는 일이 된다. systemd 가 5초 뒤
    다시 띄우지만, DB 가 늦게 돌아오면 5분에 5번을 넘겨 죽으면서 systemd 가 아예
    손을 놓는다(StartLimitBurst, deploy/c3r.service). 그러면 사람이 와서
    reset-failed 를 해 줄 때까지 사이트가 내려가 있다.

    pg 는 이 줄에 닿기 전에 끊긴 커넥션을 풀에서 이미 빼냈다. 여기서는 받아서
    남기기만 하면 된다. 다음 조회는 새 커넥션으로 이어진다.
  */
  pool.on("error", (err) => {
    console.error("[db] 놀고 있던 커넥션이 끊겼습니다. 다음 조회에서 새로 잇습니다.", err.message);
  });

  return pool;
}

/** `?` 를 $1, $2 … 로 바꾼다. */
function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/*
  트랜잭션 안의 쿼리는 같은 커넥션에서 실행되어야 한다.
  AsyncLocalStorage 로 현재 트랜잭션 커넥션을 따라다니게 한다.
*/
const txStore = new AsyncLocalStorage<PoolClient>();

async function query<T>(sql: string, params: SqlValue[]): Promise<T[]> {
  const text = toPgPlaceholders(sql);
  const client = txStore.getStore();
  const result = client
    ? await client.query(text, params)
    : await getPool().query(text, params);
  return result.rows as T[];
}

export const postgresDriver: Driver = {
  dialect: "postgres",

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return query<T>(sql, params);
  },

  async get<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
  },

  async run(sql: string, params: SqlValue[] = []): Promise<void> {
    await query(sql, params);
  },

  async exec(sql: string): Promise<void> {
    const client = txStore.getStore();
    if (client) await client.query(sql);
    else await getPool().query(sql);
  },

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const result = await txStore.run(client, fn);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      /*
        되돌리기도 실패할 수 있다(커넥션이 이미 끊긴 경우). 그때 ROLLBACK 오류가
        위로 올라가면 진짜 원인이 로그에서 사라진다. 원인 쪽을 남긴다.
      */
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("[db] 되돌리기도 실패했습니다.", rollbackErr);
      }
      throw err;
    } finally {
      client.release();
    }
  },
};
