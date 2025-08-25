import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // เพิ่มการตรวจสอบ Environment Variables เพื่อให้แสดง Error ที่ชัดเจนขึ้น
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const errorMessage = 'Server configuration error: Missing Supabase credentials.'
    console.error(errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders from Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (e) {
    // ดักจับ Error ที่ไม่คาดคิดทั้งหมด เพื่อให้แน่ใจว่ามีการส่ง JSON กลับไปเสมอ
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred in /api/orders.'
    console.error('Unexpected error in /api/orders:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
