import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // [แก้ไข] เรียกใช้ createClient โดยไม่ต้องส่ง argument
  const supabase = createClient()
  const { data, error } = await supabase.from('orders').select('*')
  if (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }) 
  }
  return NextResponse.json({ data })
}
