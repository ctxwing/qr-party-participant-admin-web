import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Supabase PostgreSQL Pooler URL을 환경 변수에서 가져옵니다.
const connectionString = process.env.DATABASE_URL!;

// postgres 클라이언트 생성
const client = postgres(connectionString, { 
  prepare: false,
  ssl: {
    servername: 'db.hlbgedbgycamzvbbykdc.supabase.co',
    rejectUnauthorized: false,
  },
});

// Drizzle 인스턴스 생성
export const db = drizzle(client);
