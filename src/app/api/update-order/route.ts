// src/app/api/update-order/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { id, cost, slip_url, status } = await request.json()

  // 1. คำนวณกำไรใหม่ (ถ้ามีการส่ง cost มา)
  let profit = undefined
  if (typeof cost === 'number') {
    // ดึงข้อมูล charge (ราคาขาย) ของออเดอร์นี้มาก่อน
    const { data: orderData, error: fetchError } = await supabase
      .from('Orders')
      .select('charge')
      .eq('id', id)
      .single()

    if (fetchError || !orderData) {
      console.error('Error fetching order for profit calculation:', fetchError)
      return NextResponse.json({ error: 'Could not find order to calculate profit' }, { status: 404 })
    }

    profit = orderData.charge - cost
  }

  // 2. สร้าง object สำหรับอัปเดตข้อมูล
  const updateData: {
    cost?: number
    slip_url?: string
    status?: string
    profit?: number
  } = {}

  if (cost !== undefined) updateData.cost = cost
  if (slip_url !== undefined) updateData.slip_url = slip_url
  if (status !== undefined) updateData.status = status
  if (profit !== undefined) updateData.profit = profit

  // 3. อัปเดตข้อมูลกลับไปที่ Supabase
  const { data, error } = await supabase
    .from('Orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  return NextResponse.json(data)
}
