import { NextResponse } from 'next/server';
import { predictInventoryShortages } from '@/agents/predictiveInventoryAgent';

export async function GET() {
  try {
    const predictions = await predictInventoryShortages();
    return NextResponse.json({ predictions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
