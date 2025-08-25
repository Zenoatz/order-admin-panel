// src/app/api/orders/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: orders, error } = await supabase
    .from('Orders')
    .select('*')
    .order('created_at', { ascending: false }) // เรียงจากใหม่ไปเก่า

  if (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  return NextResponse.json(orders)
}