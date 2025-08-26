import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const { id, ...updateData } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // [แก้ไข] เรียกใช้ createClient โดยไม่ต้องส่ง argument
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
