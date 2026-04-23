import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    await sql`CREATE POLICY anon_insert_alerts ON alerts FOR INSERT TO anon WITH CHECK (true);`;
    await sql`CREATE POLICY anon_insert_messages ON messages FOR INSERT TO anon WITH CHECK (true);`;
    await sql`CREATE POLICY anon_insert_interactions ON interactions FOR INSERT TO anon WITH CHECK (true);`;
    await sql`CREATE POLICY anon_update_participants ON participants FOR UPDATE TO anon USING (true) WITH CHECK (true);`;
    console.log("RLS INSERT policies added for anon");
  } catch(e: any) {
    console.error("Error:", e.message);
  } finally {
    await sql.end();
  }
}
run();
