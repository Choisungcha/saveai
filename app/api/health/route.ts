import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '../../../lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const health = await healthCheck();

    // 헬스체크는 항상 200을 반환하지만 상태에 따라 내용이 다름
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}