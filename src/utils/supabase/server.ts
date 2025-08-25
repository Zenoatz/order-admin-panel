import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// นี่คือ "ผู้ช่วยสอน" TypeScript ของเราครับ
// ในบางสภาพแวดล้อม (เช่นตอน Build บน Vercel) 
// ReturnType<typeof cookies> อาจถูกตีความผิดว่าเป็น Promise
// โค้ดส่วนนี้จะช่วยดึงชนิดข้อมูลที่แท้จริง (ที่ไม่ใช่ Promise) ออกมา
type NonPromise<T> = T extends Promise<infer U> ? U : T;

export function createClient(cookieStore: NonPromise<ReturnType<typeof cookies>>) {
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
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}