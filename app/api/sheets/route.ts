import { NextRequest, NextResponse } from 'next/server'

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

export async function GET(request: NextRequest) {
  if (!SCRIPT_URL) {
    return NextResponse.json({ error: 'Google Script URL not configured' }, { status: 500 })
  }
  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()
  const url = query ? `${SCRIPT_URL}?${query}` : SCRIPT_URL
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  if (!SCRIPT_URL) {
    return NextResponse.json({ error: 'Google Script URL not configured' }, { status: 500 })
  }
  try {
    const body = await request.json()
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
