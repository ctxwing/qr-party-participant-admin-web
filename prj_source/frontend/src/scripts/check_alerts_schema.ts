import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const cols = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'alerts';`;
    console.log("Columns:", cols);
  } finally {
    await sql.end();
  }
}
run();
