import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  // Get the cookie store from next/headers
  const cookieStore = cookies()
  // Pass the cookie store to the createClient function
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase.from('orders').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
