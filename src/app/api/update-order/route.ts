import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { id, status, start_count, remains } = await request.json()

    if (!id) {
      return new NextResponse(JSON.stringify({ message: 'Order ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const cookieStore = cookies()
    
    // @ts-ignore - เราใช้คอมเมนต์นี้เพื่อบอกให้ TypeScript ไม่ต้องตรวจสอบประเภทข้อมูล
    // เนื่องจากมีปัญหาการตีความประเภทข้อมูลของ cookies() ที่ไม่ถูกต้องในบางสภาพแวดล้อม
    const supabase = createClient(cookieStore)

    const dataToUpdate: { [key: string]: any } = {}
    if (status) dataToUpdate.status = status
    if (start_count !== undefined && start_count !== null) dataToUpdate.start_count = start_count
    if (remains !== undefined && remains !== null) dataToUpdate.remains = remains

    if (Object.keys(dataToUpdate).length === 0) {
        return new NextResponse(JSON.stringify({ message: 'No fields to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(dataToUpdate)
      .eq('id', id)
      .select() // IMPORTANT: Returns the updated record

    if (error) {
      console.error('Supabase error:', error)
      return new NextResponse(JSON.stringify({ message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('API Route Error:', e);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
