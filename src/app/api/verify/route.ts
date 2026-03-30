import { NextRequest, NextResponse } from 'next/server';
import { verifyAnswer } from '@/lib/ai/verification';
import { ConfidenceMode, SynthesisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer, mode = 'balanced' } = body as { answer: SynthesisResult; mode?: ConfidenceMode };

    if (!answer || !answer.answer) {
      return NextResponse.json(
        { success: false, error: 'No answer provided for verification' },
        { status: 400 }
      );
    }

    const validModes: ConfidenceMode[] = ['fast', 'balanced', 'strict'];
    const verificationMode = validModes.includes(mode) ? mode : 'balanced';

    const result = await verifyAnswer(answer, verificationMode);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
