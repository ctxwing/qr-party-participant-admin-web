import { createBrowserClient } from '@supabase/ssr'

let adminUserIdGlobal: string | undefined = undefined

export function setAdminUserId(userId: string | undefined) {
  adminUserIdGlobal = userId
  console.log('🔐 Admin User ID 설정:', userId)
}

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // RLS 정책을 위한 custom header interceptor 추가
  const originalFetch = supabase.fetch.bind(supabase)
  supabase.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        'x-admin-user-id': adminUserIdGlobal || '',
      },
    }
    console.log('📤 Supabase 요청:', {
      url: typeof input === 'string' ? input.slice(0, 80) : input.toString(),
      'x-admin-user-id': adminUserIdGlobal || '(없음)',
    })
    return originalFetch(input, newInit)
  }

  return supabase
}
