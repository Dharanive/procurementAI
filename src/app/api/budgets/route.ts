import { NextResponse } from 'next/server';
import { getBudgetStatus } from '@/agents/budgetAgent';

export async function GET() {
  try {
    const budgets = await getBudgetStatus();
    return NextResponse.json({ budgets });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
