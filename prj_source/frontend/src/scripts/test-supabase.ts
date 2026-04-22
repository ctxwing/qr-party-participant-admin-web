import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
  process.exit(1)
}

console.log('Supabase 연결 테스트 중...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // 간단한 익명 인증 테스트
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      console.error('연결 실패 (인증 오류):', error.message)
      return
    }
    
    console.log('✅ Supabase 연결 성공!')
    console.log('익명 사용자 ID:', data.user?.id)
    
    // 테이블 접근 테스트 (alerts 테이블)
    const { error: tableError } = await supabase.from('alerts').select('*').limit(1)
    if (tableError) {
      console.log('⚠️ 인증은 성공했으나 테이블 접근에 실패했습니다 (RLS 설정 필요할 수 있음):', tableError.message)
    } else {
      console.log('✅ 데이터베이스 테이블 접근 성공!')
    }
    
  } catch (err) {
    console.error('시스템 오류:', err)
  }
}

testConnection()
