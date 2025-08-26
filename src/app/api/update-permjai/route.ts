import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Order } from '@/types'

const PERMJAI_API_URL = "https://permjai.com/adminapi/v2/orders/status";

async function updatePermjai(orderData: { id: number; status?: string; start_count?: number; remains?: number }) {
  const permjaiApiKey = process.env.PERMJAI_API_KEY;
  if (!permjaiApiKey) {
    throw new Error('Permjai API key is not configured');
  }

  const payload: { order_id: number; status?: string; start_count?: number; remains?: number } = {
    order_id: orderData.id,
  };

  // ส่งข้อมูลเฉพาะที่มีการเปลี่ยนแปลงและ Permjai API รองรับ
  if (orderData.start_count !== undefined) payload.start_count = orderData.start_count;
  if (orderData.remains !== undefined) payload.remains = orderData.remains;
  
  // แปลง status ที่รองรับเป็นตัวพิมพ์เล็ก
  const validStatuses = ['Completed', 'Partial', 'Canceled'];
  if (orderData.status && validStatuses.includes(orderData.status)) {
    payload.status = orderData.status.toLowerCase();
  }

  // ไม่ต้องส่งถ้าไม่มีอะไรให้อัปเดต (นอกจาก order_id)
  if (Object.keys(payload).length <= 1) {
      console.log("No data to update on Permjai for order:", orderData.id);
      return;
  }

  console.log('Sending update to Permjai:', payload);
  
  const response = await fetch(PERMJAI_API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': permjaiApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok || responseData.error_code !== 0) {
    console.error('Permjai API Error:', responseData);
    throw new Error(responseData.error_message || 'Failed to update order on Permjai');
  }
  console.log('Successfully updated order on Permjai:', responseData);
}


export async function POST(request: Request) {
  const body = await request.json();
  const { id, status, start_count, remains } = body;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Order ID is required' }), { status: 400 });
  }

  try {
    // --- 1. อัปเดต Supabase ---
    const cookieStore = cookies();
    // @ts-expect-error - Supabase client creation type mismatch in some environments
    const supabase = createClient(cookieStore);

    // แก้ไข: กำหนด type ที่ชัดเจนเพื่อหลีกเลี่ยงการใช้ 'any'
    const dataToUpdate: Partial<Pick<Order, 'status' | 'start_count' | 'remains'>> = {};
    if (status) dataToUpdate.status = status;
    if (start_count !== undefined) dataToUpdate.start_count = start_count;
    if (remains !== undefined) dataToUpdate.remains = remains;

    if (Object.keys(dataToUpdate).length === 0) {
      return new NextResponse(JSON.stringify({ message: 'No fields to update' }), { status: 400 });
    }

    const { data: supabaseData, error: supabaseError } = await supabase
      .from('orders')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    // --- 2. อัปเดต Permjai ---
    await updatePermjai({ id, status, start_count, remains });

    return NextResponse.json(supabaseData);

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An internal server error occurred';
    console.error('API Route Error:', errorMessage);
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
}
