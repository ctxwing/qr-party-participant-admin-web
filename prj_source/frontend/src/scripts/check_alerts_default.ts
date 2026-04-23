import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const def = await sql`SELECT column_default FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'id';`;
    console.log("Default:", def);
  } finally {
    await sql.end();
  }
}
run();
