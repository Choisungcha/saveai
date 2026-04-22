import { NextRequest, NextResponse } from 'next/server';

interface ProcessPaymentRequest {
  cardId: string;
  amount: number;
  category: string;
  location?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessPaymentRequest = await request.json();
    const { cardId, amount, category } = body;

    // 입력 검증
    if (!cardId || !amount || !category) {
      return NextResponse.json(
        { error: 'Card ID, amount, and category are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // 실제로는 결제 게이트웨이 (토스페이먼츠, KG이니시스 등)와 연동
    // 여기서는 모의 결제 처리

    // 카드별 혜택 계산 (간단한 로직)
    let savings = 0;
    let benefitDescription = '';

    switch (cardId) {
      case 'shinhan-classic':
        if (category === '스타벅스') {
          savings = Math.round(amount * 0.3); // 30% 할인
          benefitDescription = '카페 30% 할인 적용';
        } else if (category === '편의점') {
          savings = Math.round(amount * 0.015); // 1.5% 캐시백
          benefitDescription = '1.5% 캐시백 적용';
        }
        break;
      case 'hana-card':
        if (category === '스타벅스') {
          savings = Math.round(amount * 0.1) + 1500; // 10% 할인 + 1,500원 캐시백
          benefitDescription = '10% 할인 + 1,500원 캐시백 적용';
        }
        break;
      case 'kb-card':
        if (category === '스타벅스') {
          savings = 5000; // 5,000원 할인
          benefitDescription = '5,000원 할인 적용';
        }
        break;
      default:
        savings = 0;
        benefitDescription = '혜택 없음';
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: `결제가 성공적으로 처리되었습니다. ${benefitDescription}`,
      transactionId: `txn_${Date.now()}`,
      amount,
      savings,
      finalAmount: amount - savings,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}