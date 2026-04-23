import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    await sql`CREATE POLICY anon_select_sessions ON party_sessions FOR SELECT TO anon USING (true);`;
    console.log("RLS SELECT policy added for anon on party_sessions");
  } catch(e: any) {
    console.error("Error:", e.message);
  } finally {
    await sql.end();
  }
}
run();
