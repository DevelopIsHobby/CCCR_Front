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
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    /* 관리형 DB 처럼 TLS 를 요구하는 곳을 위해 DATABASE_SSL=1 로 켠다. */
    ssl: process.env.DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined,
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
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
