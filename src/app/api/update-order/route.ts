import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, cost, slip_url, status } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  const cookieStore = await cookies() // <--- แก้ไขโดยการเพิ่ม await
  const supabase = createClient(cookieStore)

  // First, get the current order to calculate profit
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
  const profit = charge - cost

  const { data, error } = await supabase
    .from('orders')
    .update({
      cost,
      slip_url,
      status,
      profit,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}