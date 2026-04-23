import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const sessions = await sql`SELECT id, status FROM party_sessions;`;
    console.log("Sessions:", sessions);
  } finally {
    await sql.end();
  }
}
run();
