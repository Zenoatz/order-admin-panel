import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()

  // ✅ แก้ไข: สร้าง Supabase client โดยตรงในไฟล์นี้
  // เพื่อหลีกเลี่ยงปัญหา Type-checking ที่เกิดขึ้นใน Environment ของคุณ
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
  
  const { id, status, start_count, remains } = await req.json()

  if (id === undefined || status === undefined) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
  }

  try {
    // 1. อัปเดตข้อมูลในฐานข้อมูล Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('orders')
      .update({ 
        status, 
        start_count: start_count ?? null,
        remains: remains ?? null 
      })
      .eq('permjai_order_id', id)
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase update error:', supabaseError);
      throw supabaseError
    }

    // 2. ส่งข้อมูลไปอัปเดตที่ Permjai ผ่าน API Route ของเรา
    const internalApiUrl = new URL('/api/update-permjai', req.url);

    const permjaiUpdateResponse = await fetch(internalApiUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, start_count, remains }),
    });

    if (!permjaiUpdateResponse.ok) {
        const errorBody = await permjaiUpdateResponse.json();
        throw new Error(errorBody.error || 'Failed to update Permjai status.');
    }

    const permjaiUpdateData = await permjaiUpdateResponse.json();

    // 3. ส่งผลลัพธ์กลับไป
    return NextResponse.json({ 
      message: 'Order updated successfully in both Supabase and Permjai', 
      supabaseData: supabaseData,
      permjaiData: permjaiUpdateData.data
    })

  } catch (error: any) {
    console.error('Overall update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
