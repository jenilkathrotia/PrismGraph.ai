import { NextRequest, NextResponse } from 'next/server';
import { synthesizeAnswer } from '@/lib/ai/synthesis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid research question' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedQuestion = question.trim().slice(0, 1000);

    const result = await synthesizeAnswer(sanitizedQuestion);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
