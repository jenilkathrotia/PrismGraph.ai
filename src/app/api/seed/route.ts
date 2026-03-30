import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/neo4j/seed';
import { getGraphStats } from '@/lib/neo4j/queries';

export async function POST() {
  try {
    await seedDemoData();
    const stats = await getGraphStats();
    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      stats,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
