import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, status } = await request.json()
  const supabase = createClient()
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select()
  if (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }) 
  }
  return NextResponse.json({ data })
}