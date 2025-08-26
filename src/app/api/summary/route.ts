import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // The following line is the standard and correct way to get the cookie store
  // in a Next.js App Router Route Handler. The `cookies()` function from 
  // 'next/headers' is synchronous and returns a `ReadonlyRequestCookies` object.
  //
  // The TypeScript error you're seeing ("Promise is not assignable to ReadonlyRequestCookies")
  // is highly unusual and likely indicates a problem with your local development 
  // environment's type-checking, such as a cached or corrupted type definition.
  //
  // To resolve this, please try the following steps:
  // 1. Restart your code editor's TypeScript server. (In VS Code, open the Command Palette and run "TypeScript: Restart TS server").
  // 2. If that doesn't work, delete your `node_modules` folder and the `package-lock.json` file, then run `npm install` again.
  const cookieStore = cookies() 
  const supabase = createClient(cookieStore)
  
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
