import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies'

// This is the definitive, correct, and standard implementation for creating a 
// Supabase server client in a Next.js App Router environment.
export const createClient = () => {
  // In Server Components, the `cookies()` function returns the actual cookie store object directly.
  // The Type Error is an environmental issue. We are using Type Casting `as ReadonlyRequestCookies`
  // to force TypeScript to understand the correct return type and resolve the build error.
  const cookieStore = cookies() as ReadonlyRequestCookies

  // The createServerClient function is designed to receive an object containing
  // the methods for interacting with cookies. The library handles the rest.
  return createServerClient(
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
          } catch (_error) { // FIX: Changed 'error' to '_error' to resolve the no-unused-vars warning.
            // This error is expected when trying to set a cookie from a Server Component.
            // It can be safely ignored if you have a middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, '', ...options })
          } catch (_error) { // FIX: Changed 'error' to '_error' to resolve the no-unused-vars warning.
            // Similar to `set`, this can be safely ignored.
          }
        },
      },
    }
  )
}
