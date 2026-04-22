import postgres from 'postgres'
import { config } from 'dotenv'
import path from 'path'

// .env.local 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

const sql = postgres(process.env.SUPABASE_DB_URL || 'postgresql://postgres:@Supabase01@db.hlbgedbgycamzvbbykdc.supabase.co:5432/postgres')

async function migrate() {
  console.log('🚀 Supabase Full Spec 마이그레이션을 시작합니다...')

  try {
    // 1. participants 테이블 확장 (필드 추가)
    console.log('--- participants 테이블 필드 추가 중...')
    await sql`
      ALTER TABLE public.participants 
      ADD COLUMN IF NOT EXISTS is_first_applied boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_second_applied boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS cupid_count integer DEFAULT 2,
      ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 3;
    `

    // 2. interactions 테이블에 session_id 추가 (명세서 반영)
    console.log('--- interactions 테이블 필드 추가 중...')
    await sql`
      ALTER TABLE public.interactions 
      ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.party_sessions(id);
    `

    // 3. 기존 데이터 초기화 (횟수 부여)
    console.log('--- 기존 참여자 횟수 초기화 중...')
    await sql`
      UPDATE public.participants 
      SET cupid_count = 2, like_count = 3 
      WHERE cupid_count IS NULL OR like_count IS NULL;
    `

    console.log('✅ 마이그레이션 성공!')
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
  } finally {
    await sql.end()
  }
}

migrate()
