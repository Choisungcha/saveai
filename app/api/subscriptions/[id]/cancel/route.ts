import { NextRequest, NextResponse } from 'next/server';

interface CancelSubscriptionRequest {
  reason?: string;
  confirmCancellation?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    let body: CancelSubscriptionRequest = {};
    try {
      body = await request.json();
    } catch {
      // body가 없어도 괜찮음
    }

    // 입력 검증
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 구독 상태 업데이트
    // 여기서는 모의 응답

    // 해지 사유 로깅 (선택사항)
    if (body.reason) {
      console.log(`Subscription ${subscriptionId} cancelled. Reason: ${body.reason}`);
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '구독이 성공적으로 해지되었습니다.',
      subscriptionId,
      cancelledAt: new Date().toISOString(),
      estimatedSavings: 204000, // 연간 절약 금액
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}