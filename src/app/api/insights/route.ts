import { NextResponse } from 'next/server';
import { generateInsights } from '@/lib/ai/insights';

export async function GET() {
  try {
    const insights = await generateInsights();
    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
