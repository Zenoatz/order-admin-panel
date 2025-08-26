import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (_) { // Corrected: Use '_' to suppress the unused variable warning.
            // The `set` method is used by the Supabase Auth Helper for Next.js.
            // If this `set` method is called in a Server Component, an error is thrown,
            // as cookies can't be set from there.
            // The error is safe to ignore; the Supabase client will fall back to retrieving
            // cookies from the request headers.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (_) { // Corrected: Use '_' to suppress the unused variable warning.
            // Similar to `set`, this can be safely ignored.
          }
        },
      },
    }
  )
}
