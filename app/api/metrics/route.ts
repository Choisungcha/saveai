import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '../../../lib/metrics';

export async function GET(request: NextRequest) {
  try {
    // Prometheus 포맷으로 메트릭 반환
    const metrics = await getMetrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Metrics collection failed:', error);
    return NextResponse.json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}