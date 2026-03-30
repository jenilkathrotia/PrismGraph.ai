import { NextResponse } from 'next/server';
import { verifyConnectivity } from '@/lib/neo4j/driver';
import { isAIAvailable } from '@/lib/ai/provider';

export async function GET() {
  const neo4jOk = await verifyConnectivity();
  const aiOk = isAIAvailable();

  const status = neo4jOk ? 'healthy' : 'degraded';

  return NextResponse.json({
    status,
    services: {
      neo4j: neo4jOk ? 'connected' : 'disconnected',
      ai: aiOk ? 'configured' : 'mock_mode',
    },
    timestamp: new Date().toISOString(),
  }, { status: neo4jOk ? 200 : 503 });
}
