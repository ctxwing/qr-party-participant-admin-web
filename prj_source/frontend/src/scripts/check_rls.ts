import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const policies = await sql`SELECT tablename, policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'alerts';`;
    console.log("Policies:", policies);
  } finally {
    await sql.end();
  }
}
run();
