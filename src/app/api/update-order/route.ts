import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Order } from '@/types';

export async function POST(request: Request) {
  try {
    const { id, status, start_count, remains, service_name } = await request.json()

    if (!id) {
      return new NextResponse(JSON.stringify({ message: 'Order ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const cookieStore = cookies()
    
    // @ts-expect-error - We use this comment to tell TypeScript to ignore the type check
    // because of a misinterpretation of the cookies() return type in some environments.
    const supabase = createClient(cookieStore)

    // Define a clearer type to avoid using 'any'
    const dataToUpdate: { 
      status?: Order['status']; 
      start_count?: number | null; 
      remains?: number | null;
      service_name?: string | null; // Added service_name
    } = {}

    if (status) dataToUpdate.status = status
    if (start_count !== undefined) dataToUpdate.start_count = start_count
    if (remains !== undefined) dataToUpdate.remains = remains
    if (service_name) dataToUpdate.service_name = service_name // Added logic to update service_name

    if (Object.keys(dataToUpdate).length === 0) {
        return new NextResponse(JSON.stringify({ message: 'No fields to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(dataToUpdate)
      .eq('id', id)
      .select() // IMPORTANT: Returns the updated record

    if (error) {
      console.error('Supabase error:', error)
      return new NextResponse(JSON.stringify({ message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return NextResponse.json(data)
  } catch (e: unknown) { // Use 'unknown' for better type safety
    console.error('API Route Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An internal server error occurred';
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
