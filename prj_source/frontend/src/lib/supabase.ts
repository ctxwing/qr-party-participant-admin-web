import { createBrowserClient } from '@supabase/ssr'

let adminUserIdGlobal: string | undefined = undefined

export function setAdminUserId(userId: string | undefined) {
  adminUserIdGlobal = userId
}

let clientSingleton: ReturnType<typeof createBrowserClient> | undefined = undefined

export function createClient() {
  if (clientSingleton) return clientSingleton

  clientSingleton = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const originalFetch = clientSingleton.fetch.bind(clientSingleton)
  clientSingleton.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        'x-admin-user-id': adminUserIdGlobal || '',
      },
    }
    return originalFetch(input, newInit)
  }

  return clientSingleton
}
