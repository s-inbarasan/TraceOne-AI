import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  
  if (typeof window === 'undefined') {
    return createBrowserClient(url, key, {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    })
  }

  if (!client) {
    client = createBrowserClient(url, key)
  }
  return client
}
