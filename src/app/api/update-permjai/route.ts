import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // ดึงข้อมูลที่จำเป็นจาก request body
  const { id, status, start_count, remains } = await req.json();

  // ดึงค่า API Key และ URL จาก environment variables
  const permjaiApiKey = process.env.PERMJAI_API_KEY;
  const permjaiApiUrl = process.env.PERMJAI_API_URL;

  // ตรวจสอบว่ามีค่าที่จำเป็นครบถ้วนหรือไม่
  if (!permjaiApiKey || !permjaiApiUrl) {
    return NextResponse.json(
      { error: 'Permjai API Key or URL is not configured in environment variables.' },
      { status: 500 }
    );
  }

  if (id === undefined || status === undefined) {
    return NextResponse.json({ error: 'Missing order id or status' }, { status: 400 });
  }

  // สร้าง body สำหรับส่งไปยัง Permjai API
  const permjaiRequestBody = {
    id: Number(id),
    status: status,
    start_count: start_count ? Number(start_count) : undefined,
    remains: remains !== undefined ? Number(remains) : undefined,
  };

  try {
    // เรียกใช้งาน Permjai API
    const response = await fetch(`${permjaiApiUrl}/orders/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': permjaiApiKey,
      },
      body: JSON.stringify(permjaiRequestBody),
    });

    // ตรวจสอบ response จาก Permjai
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from Permjai API:', errorData);
        throw new Error(errorData.error_message || `Permjai API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // ส่ง response กลับไปยัง client
    return NextResponse.json({ message: 'Successfully updated Permjai', data });

  } catch (error: any) {
    console.error('Failed to update Permjai:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
