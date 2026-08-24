import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  vennetSql?: ReturnType<typeof postgres>;
  vennetDb?: Database;
};

function getDb(): Database {
  if (!globalForDb.vennetDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }
    globalForDb.vennetSql ??= postgres(url, { max: 1, prepare: false });
    globalForDb.vennetDb = drizzle(globalForDb.vennetSql, { schema });
  }
  return globalForDb.vennetDb;
}

/**
 * Connection is established on first property access so that builds and
 * modules that never touch the database do not require DATABASE_URL.
 */
export const db: Database = new Proxy({} as Database, {
  get: (_target, prop) => Reflect.get(getDb(), prop),
});

export { schema };
