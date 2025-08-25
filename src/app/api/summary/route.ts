// src/app/api/summary/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // --- 1. รับค่าเดือนและปีจาก URL ---
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month') // e.g., '8' for August
  const year = searchParams.get('year')   // e.g., '2025'

  // --- 2. ตรวจสอบว่าได้รับข้อมูลครบหรือไม่ ---
  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
  }

  // --- 3. สร้างช่วงวันที่สำหรับค้นหา ---
  // แปลง month และ year ที่เป็น string ให้เป็นตัวเลข
  const monthInt = parseInt(month, 10)
  const yearInt = parseInt(year, 10)

  // วันที่เริ่มต้นของเดือนที่ต้องการ (e.g., 2025-08-01)
  const startDate = new Date(yearInt, monthInt - 1, 1)
  // วันที่สิ้นสุด (คือวันแรกของเดือนถัดไป e.g., 2025-09-01)
  const endDate = new Date(yearInt, monthInt, 1)

  const supabase = createClient()

  // --- 4. ดึงข้อมูลจาก Supabase ---
  const { data: orders, error } = await supabase
    .from('Orders')
    .select('charge, cost, profit')
    // ดึงข้อมูลที่ 'created_at' มากกว่าหรือเท่ากับ startDate
    .gte('created_at', startDate.toISOString())
    // และ 'created_at' น้อยกว่า endDate
    .lt('created_at', endDate.toISOString())

  if (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json({ error: 'Failed to fetch summary data' }, { status: 500 })
  }

  // --- 5. คำนวณยอดรวม ---
  const initialSummary = { totalCharge: 0, totalCost: 0, totalProfit: 0 }

  const summary = orders.reduce((acc, order) => {
    acc.totalCharge += order.charge || 0
    acc.totalCost += order.cost || 0
    acc.totalProfit += order.profit || 0
    return acc
  }, initialSummary)

  // --- 6. ส่งผลลัพธ์กลับไป ---
  return NextResponse.json(summary)
}