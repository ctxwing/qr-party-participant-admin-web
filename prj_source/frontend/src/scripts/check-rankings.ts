import postgres from 'postgres'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.SUPABASE_DB_URL || 'postgresql://postgres:@Supabase01@db.hlbgedbgycamzvbbykdc.supabase.co:5432/postgres')

async function checkRankings() {
  console.log('📊 실시간 랭킹 데이터 확인 중...')
  try {
    const rankings = await sql`
      SELECT p.nickname, COUNT(i.id) as score
      FROM public.participants p
      JOIN public.interactions i ON p.id = i.receiver_id
      GROUP BY p.nickname
      ORDER BY score DESC
      LIMIT 5;
    `
    if (rankings.length === 0) {
      console.log('ℹ️ 아직 상호작용 데이터가 없습니다. (가상 유저들이 활동 전입니다.)')
    } else {
      console.table(rankings)
    }
  } catch (error) {
    console.error('❌ 데이터 확인 실패:', error)
  } finally {
    await sql.end()
  }
}

checkRankings()
