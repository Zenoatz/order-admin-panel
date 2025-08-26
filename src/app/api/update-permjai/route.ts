import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { order_id, status } = await request.json()

  if (!order_id || !status) {
    return NextResponse.json(
      { error: 'Order ID and status are required' },
      { status: 400 }
    )
  }

  const permjaiApiKey = process.env.PERMJAI_API_KEY
  if (!permjaiApiKey) {
    console.error('PERMJAI_API_KEY is not set in environment variables.')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Permjai API expects lowercase status, e.g., "completed"
  const permjaiStatus = status.toLowerCase()

  try {
    const response = await fetch(
      'https://permjai.com/adminapi/v2/orders/change-status',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': permjaiApiKey,
        },
        body: JSON.stringify({
          ids: String(order_id), // API expects a string of comma-separated IDs
          status: permjaiStatus,
        }),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      // Forward the error from Permjai API
      console.error('Failed to update Permjai status:', responseData)
      return NextResponse.json(
        {
          error: `Permjai API error: ${
            responseData.error_message || 'Unknown error'
          }`,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('Error calling Permjai API:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}