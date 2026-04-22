import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedInteractions() {
  console.log('💓 가상 상호작용(호감도/큐피트) 생성을 시작합니다...')

  // 1. 참여자 목록 가져오기
  const { data: participants } = await supabase.from('participants').select('id')
  const { data: session } = await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').single()

  if (!participants || participants.length < 2) {
    console.log('참여자가 부족합니다.')
    return
  }

  const interactions = []

  // 2. 무작위로 50개의 상호작용 생성
  for (let i = 0; i < 50; i++) {
    const sender = participants[Math.floor(Math.random() * participants.length)]
    const receiver = participants[Math.floor(Math.random() * participants.length)]
    
    if (sender.id === receiver.id) continue

    interactions.push({
      type: Math.random() > 0.3 ? 'LIKE' : 'CUPID',
      sender_id: sender.id,
      receiver_id: receiver.id,
      session_id: session?.id,
      weight: Math.random() > 0.5 ? 1 : 2
    })
  }

  const { error } = await supabase.from('interactions').insert(interactions)

  if (error) {
    console.error('❌ 상호작용 생성 실패:', error)
  } else {
    console.log(`✅ ${interactions.length}개의 가상 상호작용이 생성되었습니다! 이제 랭킹 페이지를 확인해 보세요.`)
  }
}

seedInteractions()
