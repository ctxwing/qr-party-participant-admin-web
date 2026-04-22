import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

console.log('Supabase 관리자 권한(service_role) 연결 테스트 중...')

// service_role 키를 사용하여 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testAdminConnection() {
  try {
    // 유저 목록 조회 테스트 (관리자 권한 필요)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ 관리자 연결 실패:', error.message)
      return
    }
    
    console.log('✅ Supabase 관리자 권한 연결 성공!')
    console.log('현재 등록된 유저 수:', data.users.length)
    
  } catch (err) {
    console.error('시스템 오류:', err)
  }
}

testAdminConnection()
