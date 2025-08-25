import { supabase } from '@/lib/supabaseClient';
import { NextResponse, type NextRequest } from 'next/server';

// สร้างฟังก์ชันสำหรับจัดการคำขอแบบ POST
export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูลที่ส่งมาจากหน้าเว็บ (Frontend)
    const body = await request.json();
    const { id, cost, slip_url, status, charge } = body;

    // ตรวจสอบว่ามี id ส่งมาหรือไม่
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // เตรียม object สำหรับเก็บข้อมูลที่จะอัปเดต
    const updateData: { [key: string]: any } = {};

    if (cost !== undefined) {
      updateData.cost = cost;
      // คำนวณกำไร ถ้ามีต้นทุนและราคาขายส่งมา
      if (charge !== undefined) {
        updateData.profit = parseFloat(charge) - parseFloat(cost);
      }
    }
    if (slip_url !== undefined) {
      updateData.slip_url = slip_url;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // หากไม่มีข้อมูลให้อัปเดตเลย
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    // อัปเดตข้อมูลในตาราง 'Orders' โดยอ้างอิงจาก id
    const { data, error } = await supabase
      .from('Orders')
      .update(updateData)
      .eq('id', id) // .eq('id', id) หมายถึง "ที่ซึ่งคอลัมน์ id มีค่าเท่ากับ id ที่ส่งมา"
      .select() // .select() เพื่อให้ Supabase คืนค่าข้อมูลที่อัปเดตแล้วกลับมา
      .single(); // .single() เพื่อให้คืนค่าแค่ object เดียว

    // หากเกิดข้อผิดพลาด
    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // หากสำเร็จ ส่งข้อมูลที่อัปเดตแล้วกลับไป
    return NextResponse.json(data);

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
