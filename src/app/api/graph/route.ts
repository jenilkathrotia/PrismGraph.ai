import { NextRequest, NextResponse } from 'next/server';
import { getFullGraph, getNodeNeighborhood, searchGraph } from '@/lib/neo4j/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const query = searchParams.get('q');
    const depth = parseInt(searchParams.get('depth') || '1');

    if (query) {
      const results = await searchGraph(query);
      return NextResponse.json({ success: true, data: { nodes: results, edges: [] } });
    }

    if (nodeId) {
      const data = await getNodeNeighborhood(nodeId, depth);
      return NextResponse.json({ success: true, data });
    }

    const data = await getFullGraph();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Graph query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query graph' },
      { status: 500 }
    );
  }
}
