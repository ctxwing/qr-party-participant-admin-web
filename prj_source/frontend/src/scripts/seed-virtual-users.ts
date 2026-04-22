import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// .env.local 로드
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const virtualNicknames = [
  '상큼체리', '젠틀맨', '춤추는곰', '미소천사', '불타는낙지', 
  '새벽별', '바다코끼리', '번개파워', '슈퍼히어로', '커피매니아',
  '비구름', '초코쿠키', '우주비행사', '산들바람', '푸른하늘',
  '달빛사냥꾼', '무지개', '들꽃', '북극곰', '펭귄친구'
]

async function seed() {
  console.log('🚀 가상 유저 생성을 시작합니다...')

  // 1. 활성화된 세션 확인
  const { data: session } = await supabase
    .from('party_sessions')
    .select('id')
    .eq('status', 'ONGOING')
    .single()

  if (!session) {
    console.error('❌ 활성화된 파티 세션이 없습니다. 먼저 /setup 에서 파티를 시작하세요.')
    return
  }

  // 2. 가상 유저 데이터 준비
  const participants = virtualNicknames.map((nickname, index) => ({
    session_id: session.id,
    anonymous_id: `virtual_user_${index}`,
    nickname: nickname,
    last_active: new Date().toISOString(),
    is_first_applied: Math.random() > 0.3, // 70% 확률로 1차 신청 완료
    is_second_applied: Math.random() > 0.7, // 30% 확률로 2차 신청 완료
    cupid_count: 2,
    like_count: 3
  }))

  // 3. Upsert 실행 (타입 호환성을 위해 UUID 대신 TEXT로 처리될 수 있음)
  const { error } = await supabase
    .from('participants')
    .upsert(participants, { onConflict: 'anonymous_id' })

  if (error) {
    console.error('❌ 가상 유저 생성 실패:', error.message)
  } else {
    console.log(`✅ ${participants.length}명의 가상 유저가 생성/업데이트 되었습니다!`)
  }
}

seed()
