import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function verify() {
  console.log('🏁 QR 파티 Supabase 최종 통합 검증 시작...\n')

  try {
    // 0. 관리자 권한 쓰기 테스트 (진단용)
    const { error: adminError } = await supabaseAdmin
      .from('participants')
      .upsert({ id: 'admin-test', nickname: '관리자봇' })
    if (adminError) throw new Error(`[진단] 관리자 권한으로도 쓰기 실패: ${adminError.message}`)
    console.log('✅ 0. [진단] 테이블 구조 및 관리자 접속: 정상')

    // 1. 인증 테스트
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
    if (authError) throw new Error(`인증 실패: ${authError.message}`)
    console.log('✅ 1. 익명 인증: 성공 (ID: ' + authData.user?.id + ')')

    // 2. Participants 테이블 테스트 (UPSERT 대신 INSERT로 변경하여 진단)
    const { error: pError } = await supabase
      .from('participants')
      .insert({ id: authData.user?.id, nickname: '검증봇_' + Math.random().toString(36).substring(7) })
    if (pError) throw new Error(`Participants 테이블 INSERT 실패: ${pError.message}`)
    console.log('✅ 2. Participants 테이블 INSERT: 성공')

    // 3. Alerts 테이블 테스트
    const { error: aError } = await supabase
      .from('alerts')
      .insert({ participant_id: authData.user?.id, type: 'SYSTEM', message: '연결 테스트 중' })
    if (aError) throw new Error(`Alerts 테이블 오류: ${aError.message}`)
    console.log('✅ 3. Alerts 테이블 쓰기/RLS: 성공')

    // 4. Messages 테이블 테스트
    const { error: mError } = await supabase
      .from('messages')
      .insert({ sender_id: authData.user?.id, content: 'Hello World' })
    if (mError) throw new Error(`Messages 테이블 오류: ${mError.message}`)
    console.log('✅ 4. Messages 테이블 쓰기/RLS: 성공')

    // 5. 데이터 조회 테스트
    const { data: readData, error: rError } = await supabase.from('alerts').select('*').limit(1)
    if (rError) throw new Error(`데이터 조회 오류: ${rError.message}`)
    console.log('✅ 5. 데이터 읽기 권한: 성공')

    console.log('\n🎊 모든 검증이 완료되었습니다! 서비스 운영 준비 완료!')

  } catch (err: any) {
    console.error('\n❌ 검증 실패:', err.message)
    console.log('\n💡 팁: Supabase SQL Editor에서 RLS 정책(CREATE POLICY)이 정확히 실행되었는지 확인하세요.')
  }
}

verify()
