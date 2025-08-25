// src/app/api/orders/route.ts

import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

// สร้างฟังก์ชันสำหรับจัดการคำขอแบบ GET
export async function GET() {
  try {
    // ใช้ supabase client เพื่อดึงข้อมูลจากตาราง 'Orders'
    // .select('*') หมายถึง ดึงทุกคอลัมน์
    // .order('created_at', { ascending: false }) หมายถึง เรียงข้อมูลตามวันที่สร้างล่าสุดก่อน
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .order('created_at', { ascending: false });

    // หากเกิดข้อผิดพลาดในการดึงข้อมูล
    if (error) {
      console.error('Error fetching orders:', error);
      // ส่งข้อความข้อผิดพลาดกลับไปพร้อมสถานะ 500
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // หากสำเร็จ ส่งข้อมูลที่ได้กลับไป
    return NextResponse.json(data);

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}