import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { id, permjai_status } = await request.json()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from('orders').update({ permjai_status }).eq('id', id).select()
  if (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }) 
  }
  return NextResponse.json({ data })
}
