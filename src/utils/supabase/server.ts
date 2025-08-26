import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// นี่คือโค้ดเวอร์ชันที่ถูกต้องและเป็นมาตรฐานสำหรับการใช้งานใน Next.js
// ซึ่งจะจัดการกับการทำงานของ cookie ฝั่ง server ได้อย่างถูกต้อง
export const createClient = () => {
  // 1. ดึง cookie store ออกมาจาก Next.js headers
  // ฟังก์ชัน cookies() จะคืนค่า object ที่มีเมธอด .get(), .set() มาให้โดยตรง
  // ไม่ได้คืนค่าเป็น Promise ดังนั้นเราจึงไม่จำเป็นต้องใช้ await
  const cookieStore = cookies()

  // 2. สร้างฟังก์ชันสำหรับจัดการ cookie แต่ละประเภท (get, set, remove)
  // นี่คือส่วนที่ไลบรารี @supabase/ssr จะเรียกใช้เพื่ออ่านและเขียน session
  const getCookie = (name: string) => {
    return cookieStore.get(name)?.value
  }

  const setCookie = (name: string, value: string, options: CookieOptions) => {
    try {
      cookieStore.set({ name, value, ...options })
    } catch (error) {
      // การเรียก .set จาก Server Component สามารถเกิดขึ้นได้ และไม่เป็นปัญหา
      // หากมี middleware คอย refresh session อยู่แล้ว จึงสามารถละเลย error นี้ได้
    }
  }

  const removeCookie = (name: string, options: CookieOptions) => {
    try {
      cookieStore.set({ name, value: '', ...options })
    } catch (error) {
      // เช่นเดียวกับการ set, การเรียก .delete (ผ่านการ set ค่าว่าง) จาก Server Component
      // สามารถละเลยได้
    }
  }

  // 3. สร้างและคืนค่า Supabase client พร้อมกับส่งฟังก์ชันจัดการ cookie เข้าไป
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: getCookie,
        set: setCookie,
        remove: removeCookie,
      },
    }
  )
}
