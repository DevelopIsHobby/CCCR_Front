import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { driver } from "./client";
import { now, type Driver } from "./driver";

/*
  마이그레이션 러너.
  migrations/<방언>/ 안의 .sql 파일을 이름순으로 한 번씩만 실행하고
  적용한 파일명을 schema_migrations 에 기록한다.
*/
let done: Promise<Driver> | null = null;

async function run(): Promise<Driver> {
  const db = driver();
  const dir = join(process.cwd(), "src/lib/db/migrations", db.dialect);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const rows = await db.all<{ name: string }>("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;

    const sql = readFileSync(join(dir, file), "utf8");
    await db.transaction(async () => {
      await db.exec(sql);
      await db.run("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)", [
        file,
        now(),
      ]);
    });
  }

  return db;
}

/** 쿼리 전에 스키마가 준비되어 있음을 보장한다. 실행은 프로세스당 한 번뿐이다. */
export function ready(): Promise<Driver> {
  if (!done) {
    done = run().catch((err) => {
      done = null; // 실패하면 다음 요청에서 다시 시도한다
      throw err;
    });
  }
  return done;
}
