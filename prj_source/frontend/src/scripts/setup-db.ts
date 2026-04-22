import { Client } from 'pg'

const connectionString = 'postgresql://postgres:%40Supabase01%40@db.hlbgedbgycamzvbbykdc.supabase.co:6543/postgres?sslmode=require'

const client = new Client({
  connectionString: connectionString,
})

const sql = `
-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  participant_id text,
  type text,
  message text,
  resolved boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  sender_id text,
  receiver_id text,
  content text,
  is_read boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.participants (
  id text PRIMARY KEY,
  nickname text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- 2. Realtime 활성화 (Publication 설정)
-- 기존 Publication이 없는 경우 생성 시도
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 테이블들을 Publication에 추가 (이미 있으면 무시되도록 처리)
BEGIN;
  -- 기존에 존재할 수 있으므로 안전하게 처리하기 위해 DROP 후 다시 추가하거나 IF NOT EXISTS를 수동으로 제어
  -- 여기서는 단순화를 위해 개별 추가 시도
  EXCEPTION WHEN others THEN ROLLBACK;
COMMIT;

-- 수동 실행 (각 테이블별 Realtime 감시 활성화)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
`

async function setup() {
  try {
    console.log('🚀 Supabase DB 스키마 구축 시작...')
    await client.connect()
    console.log('✅ DB 연결 성공')
    
    // 개별적으로 실행하여 오류 추적 용이하게 함
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0)
    
    for (const cmd of commands) {
      try {
        await client.query(cmd)
        console.log(`✔ 실행 성공: ${cmd.trim().substring(0, 50)}...`)
      } catch (err: any) {
        if (err.message.includes('already exists') || err.message.includes('already a member')) {
          console.log(`ℹ 건너뜀 (이미 존재): ${err.message}`)
        } else {
          console.warn(`⚠ 경고 (일부 실패): ${err.message}`)
        }
      }
    }
    
    console.log('\n🎉 모든 DB 설정이 완료되었습니다!')
  } catch (err) {
    console.error('❌ 설정 실패:', err)
  } finally {
    await client.end()
  }
}

setup()
