import postgres from 'postgres'
import { config } from 'dotenv'
import path from 'path'

// .env.local 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

const sql = postgres(process.env.SUPABASE_DB_URL || 'postgresql://postgres:@Supabase01@db.hlbgedbgycamzvbbykdc.supabase.co:5432/postgres')

async function createView() {
  console.log('🚀 v_rankings 뷰 생성을 시작합니다...')

  try {
    await sql`
      CREATE OR REPLACE VIEW public.v_rankings AS 
      SELECT 
        p.id,
        p.nickname,
        COALESCE(SUM(i.weight), 0) as score
      FROM public.participants p
      LEFT JOIN public.interactions i ON p.id = i.receiver_id
      GROUP BY p.id, p.nickname
      ORDER BY score DESC;
    `
    console.log('✅ v_rankings 뷰 생성 성공!')
  } catch (error) {
    console.error('❌ 뷰 생성 실패:', error)
  } finally {
    await sql.end()
  }
}

createView()
