import { NextResponse } from 'next/server';
import { EXCHANGES } from '@/lib/exchanges';

export async function GET() {
  return NextResponse.json({
    exchanges: EXCHANGES,
  });
}
