import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const rls = await sql`SELECT relrowsecurity FROM pg_class WHERE relname = 'party_sessions';`;
    const policies = await sql`SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'party_sessions';`;
    console.log("RLS enabled:", rls[0]?.relrowsecurity);
    console.log("Policies:", policies);
  } finally {
    await sql.end();
  }
}
run();
