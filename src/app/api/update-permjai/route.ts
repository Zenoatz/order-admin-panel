import { NextResponse } from 'next/server'

const PERMJAI_API_URL = "https://permjai.com/adminapi/v2/orders/status";

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json();
    const permjaiApiKey = process.env.PERMJAI_API_KEY;

    if (!orderId || !status) {
      return new NextResponse(JSON.stringify({ message: 'Order ID and status are required' }), { status: 400 });
    }
    if (!permjaiApiKey) {
      return new NextResponse(JSON.stringify({ message: 'Permjai API key is not configured' }), { status: 500 });
    }

    // แปลง Status ให้เป็นตัวพิมพ์เล็กตามที่ Permjai API ต้องการ
    const permjaiStatus = status.toLowerCase();
    
    const payload = {
      order_id: orderId,
      status: permjaiStatus,
    };

    console.log('Sending to Permjai:', payload);

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
      throw new Error(responseData.error_message || 'Failed to update status on Permjai');
    }

    return NextResponse.json({ message: 'Status updated on Permjai successfully', data: responseData.data });

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('API Route Error:', errorMessage);
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
}
