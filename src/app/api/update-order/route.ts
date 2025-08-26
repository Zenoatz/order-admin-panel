import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // รับ start_count และ status แบบ dynamic
  const { id, order_id, cost, slip_url, status, start_count } =
    await request.json()

  if (!id || !order_id) {
    return NextResponse.json(
      { error: 'Database ID and Order ID are required' },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. ดึงข้อมูลออเดอร์เดิมเพื่อคำนวณ profit
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('charge')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching existing order:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const charge = existingOrder.charge
  const profit = charge - (cost || 0)

  // 2. อัปเดตข้อมูลในฐานข้อมูล Supabase ของเรา
  const { data: updatedSupabaseOrder, error: supabaseUpdateError } =
    await supabase
      .from('orders')
      .update({
        cost,
        slip_url,
        status, // <-- ใช้ status ที่ส่งมา
        profit,
        start_count, // <-- เพิ่ม start_count
      })
      .eq('id', id)
      .select()
      .single()

  if (supabaseUpdateError) {
    console.error('Error updating order in Supabase:', supabaseUpdateError)
    return NextResponse.json(
      { error: supabaseUpdateError.message },
      { status: 500 }
    )
  }

  // 3. เรียก API ของเราเพื่อส่งสถานะกลับไปที่ Permjai
  let permjaiUpdateSuccess = false
  let permjaiUpdateError = null

  // เราจะอัปเดตไป Permjai ก็ต่อเมื่อ status ไม่ใช่ pending
  // และเป็น status ที่ Permjai API รองรับเท่านั้น
  const validPermjaiStatuses = ['in_progress', 'processing', 'completed']
  if (status && validPermjaiStatuses.includes(status.toLowerCase())) {
    try {
      const host = request.headers.get('host')
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
      const permjaiApiUrl = `${protocol}://${host}/api/update-permjai`

      const permjaiResponse = await fetch(permjaiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, status }),
      })

      if (permjaiResponse.ok) {
        permjaiUpdateSuccess = true
      } else {
        const errorData = await permjaiResponse.json()
        permjaiUpdateError =
          errorData.error || 'Failed to update Permjai status'
        console.error('Permjai update failed:', permjaiUpdateError)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error calling update-permjai API'
      permjaiUpdateError = message
      console.error('Error calling internal update-permjai API:', error)
    }
  }

  // 4. ส่งผลลัพธ์ทั้งหมดกลับไปยัง Frontend
  return NextResponse.json({
    data: updatedSupabaseOrder,
    permjaiStatus: {
      success: permjaiUpdateSuccess,
      error: permjaiUpdateError,
    },
  })
}