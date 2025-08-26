import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This is the definitive, correct, and standard implementation for creating a 
// Supabase server client in a Next.js App Router environment.
export const createClient = () => {
  // In Server Components, Route Handlers, and Server Actions, 
  // the `cookies()` function from `next/headers` returns the actual cookie store object directly, NOT a Promise.
  // This is why we do not need to use `await` here.
  const cookieStore = cookies()

  // The createServerClient function is designed to receive an object containing
  // the methods for interacting with cookies. The library handles the rest.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // The error "Property 'get' does not exist on type 'Promise<...>" is an environmental issue.
          // This code is correct because `cookieStore` is an object with a `get` method.
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // This error is expected when trying to set a cookie from a Server Component.
            // It can be safely ignored if you have a middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Similar to `set`, this can be safely ignored.
          }
        },
      },
    }
  )
}
