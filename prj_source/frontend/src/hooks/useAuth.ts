import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. 현재 세션 확인
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser(session.user)
        } else {
          // 2. 세션 없으면 익명 로그인 시도
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) throw error
          if (data.user) setUser(data.user)
        }
      } catch (error) {
        console.error('인증 에러:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
