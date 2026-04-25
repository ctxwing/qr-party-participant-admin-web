import type { Pool as PgPool, PoolClient, QueryResult } from "pg";
import type { Sql } from "postgres";

type PgRow = Record<string, unknown>;

class PostgresJsPoolClient implements PoolClient {
  private sql: Sql<{}>;
  private releaseFn: () => void;

  constructor(sql: Sql<{}>, releaseFn: () => void) {
    this.sql = sql;
    this.releaseFn = releaseFn;
  }

  query(
    config: string | { text: string; values?: unknown[] },
    values?: unknown[],
  ): Promise<QueryResult<PgRow>> {
    const text = typeof config === "string" ? config : config.text;
    const params = typeof config === "string" ? values ?? [] : config.values ?? [];
    return this.sql.unsafe(text, params as any[]).then(
      (rows) => ({
        rows: rows as PgRow[],
        rowCount: rows.length,
        command: "",
        oid: 0,
        fields: [],
      }),
    ) as Promise<QueryResult<PgRow>>;
  }

  release(): void {
    this.releaseFn();
  }
}

export class PostgresJsPool implements PgPool {
  private sql: Sql<{}>;

  constructor(sql: Sql<{}>) {
    this.sql = sql;
  }

  get totalCount() { return 0; }
  get idleCount() { return 0; }
  get waitingCount() { return 0; }

  query(
    config: string | { text: string; values?: unknown[] },
    values?: unknown[],
  ): Promise<QueryResult<PgRow>> {
    const text = typeof config === "string" ? config : config.text;
    const params = typeof config === "string" ? values ?? [] : config.values ?? [];
    return this.sql.unsafe(text, params as any[]).then(
      (rows) => ({
        rows: rows as PgRow[],
        rowCount: rows.length,
        command: "",
        oid: 0,
        fields: [],
      }),
    ) as Promise<QueryResult<PgRow>>;
  }

  connect(): Promise<PoolClient> {
    return Promise.resolve(new PostgresJsPoolClient(this.sql, () => {}));
  }

  end(): Promise<void> {
    return this.sql.end();
  }

  on() { return this; }
  removeListener() { return this; }
}
