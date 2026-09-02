/*
  관리자 계정을 만들거나 비밀번호를 바꾼다. 스키마가 없으면 먼저 만든다.

    node scripts/create-admin.mjs admin@cccr.or.kr "비밀번호" "최고관리자"

  어떤 DB 를 쓸지는 앱과 같은 환경변수를 따른다.
    DB_DRIVER=sqlite   (기본)  DATABASE_PATH=data/c3r.db
    DB_DRIVER=postgres         DATABASE_URL=postgres://user:pw@host:5432/c3r
*/
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const scryptAsync = promisify(scrypt);
const stamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const [email, password, name = "최고관리자"] = process.argv.slice(2);
if (!email || !password) {
  console.error("사용법: node scripts/create-admin.mjs <이메일> <비밀번호> [이름]");
  process.exit(1);
}

/* 앱(client.ts)과 같은 규칙: DB_DRIVER 가 없어도 DATABASE_URL 이 postgres 면 그쪽을 쓴다. */
const explicit = process.env.DB_DRIVER?.trim().toLowerCase();
const urlIsPostgres = /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL ?? "");

let dialect;
if (explicit === "postgres" || explicit === "postgresql") dialect = "postgres";
else if (explicit === "sqlite") dialect = "sqlite";
else dialect = urlIsPostgres ? "postgres" : "sqlite";

/* 방언별로 같은 모양의 최소 인터페이스를 만든다. */
const db = dialect === "postgres" ? await openPostgres() : openSqlite();

await db.exec(
  `CREATE TABLE IF NOT EXISTS schema_migrations (
     name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
);

const applied = new Set((await db.all("SELECT name FROM schema_migrations")).map((r) => r.name));
const dir = join(process.cwd(), "src/lib/db/migrations", dialect);

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (applied.has(file)) continue;
  await db.exec(readFileSync(join(dir, file), "utf8"));
  await db.run("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)", [file, stamp()]);
  console.log(`마이그레이션 적용: ${file}`);
}

const salt = randomBytes(16);
const derived = await scryptAsync(password.normalize("NFKC"), salt, 64);
const hash = `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;

const existing = await db.get("SELECT id FROM users WHERE email = ?", [email]);
if (existing) {
  await db.run(
    "UPDATE users SET password_hash = ?, name = ?, role = 'admin', status = 'active' WHERE id = ?",
    [hash, name, existing.id],
  );
  console.log(`관리자 계정 갱신: ${email}`);
} else {
  await db.run(
    `INSERT INTO users (email, password_hash, name, role, status, created_at)
     VALUES (?, ?, ?, 'admin', 'active', ?)`,
    [email, hash, name, stamp()],
  );
  console.log(`관리자 계정 생성: ${email}`);
}

await db.close();

/* ── 드라이버 ─────────────────────────────────────── */

function openSqlite() {
  const { DatabaseSync } = require("node:sqlite");
  const path = resolve(process.env.DATABASE_PATH ?? "data/c3r.db");
  mkdirSync(dirname(path), { recursive: true });

  const conn = new DatabaseSync(path);
  conn.exec("PRAGMA journal_mode = WAL");
  conn.exec("PRAGMA foreign_keys = ON");
  console.log(`DB(sqlite): ${path}`);

  return {
    all: async (sql, params = []) => conn.prepare(sql).all(...params),
    get: async (sql, params = []) => conn.prepare(sql).get(...params) ?? null,
    run: async (sql, params = []) => void conn.prepare(sql).run(...params),
    exec: async (sql) => conn.exec(sql),
    close: async () => conn.close(),
  };
}

async function openPostgres() {
  const { Client } = await import("pg");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL 이 필요합니다.");

  const client = new Client({
    connectionString,
    ssl: process.env.DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  console.log(`DB(postgres): ${connectionString.replace(/:[^:@/]*@/, ":****@")}`);

  /* 앱과 같은 규칙: ? 자리표시자를 $1, $2 로 바꾼다. */
  const pg = (sql) => {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  };

  return {
    all: async (sql, params = []) => (await client.query(pg(sql), params)).rows,
    get: async (sql, params = []) => (await client.query(pg(sql), params)).rows[0] ?? null,
    run: async (sql, params = []) => void (await client.query(pg(sql), params)),
    exec: async (sql) => void (await client.query(sql)),
    close: async () => client.end(),
  };
}
