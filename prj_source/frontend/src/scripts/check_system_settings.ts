import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const table = await sql`SELECT tablename FROM pg_tables WHERE tablename = 'system_settings';`;
    console.log("Table:", table);
  } finally {
    await sql.end();
  }
}
run();
