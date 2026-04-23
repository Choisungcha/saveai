import { NextRequest, NextResponse } from 'next/server';

// 금융 데이터 조회 API (모의 구현)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const userId = searchParams.get('userId');

  if (!provider || !userId) {
    return NextResponse.json({ error: 'Missing provider or userId' }, { status: 400 });
  }

  try {
    // 실제로는 각 핀테크 제공업체의 API를 호출
    const mockFinancialData = {
      toss: {
        accounts: [
          { id: 'toss_acc1', name: '토스뱅크 통장', balance: 2500000, bank: '토스뱅크' },
          { id: 'toss_acc2', name: '토스증권 계좌', balance: 1500000, bank: '토스증권' }
        ],
        cards: [
          { id: 'toss_card1', name: '토스카드', limit: 10000000, used: 2500000 }
        ],
        transactions: [
          { id: 'toss_tx1', amount: -45000, description: 'CU 편의점', date: '2024-01-15', category: '편의점' },
          { id: 'toss_tx2', amount: -125000, description: '넷플릭스', date: '2024-01-14', category: '구독' }
        ]
      },
      kakao: {
        accounts: [
          { id: 'kakao_acc1', name: '카카오뱅크 통장', balance: 1800000, bank: '카카오뱅크' }
        ],
        cards: [
          { id: 'kakao_card1', name: '카카오페이카드', limit: 5000000, used: 800000 }
        ],
        transactions: [
          { id: 'kakao_tx1', amount: -32000, description: '버스비', date: '2024-01-15', category: '교통' },
          { id: 'kakao_tx2', amount: 200000, description: '용돈', date: '2024-01-14', category: '수입' }
        ]
      },
      kg: {
        accounts: [
          { id: 'kg_acc1', name: '기업은행 통장', balance: 3200000, bank: '기업은행' }
        ],
        cards: [
          { id: 'kg_card1', name: 'IBK카드', limit: 8000000, used: 1500000 }
        ],
        transactions: [
          { id: 'kg_tx1', amount: -89000, description: '마트', date: '2024-01-15', category: '식료품' },
          { id: 'kg_tx2', amount: -156000, description: '병원비', date: '2024-01-14', category: '의료' }
        ]
      }
    };

    const data = mockFinancialData[provider as keyof typeof mockFinancialData];

    if (!data) {
      return NextResponse.json({ error: 'Provider not supported' }, { status: 400 });
    }

    // 실제 API 호출 시뮬레이션 (1-3초 랜덤 딜레이)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    return NextResponse.json({
      success: true,
      data,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Financial data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}

// 금융 데이터 동기화 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, providers } = body;

    if (!userId || !providers || !Array.isArray(providers)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 각 제공업체에 대한 동기화 시뮬레이션
    const syncResults = await Promise.allSettled(
      providers.map(async (provider: string) => {
        const response = await fetch(`${request.nextUrl.origin}/api/financial/data?provider=${provider}&userId=${userId}`);
        if (!response.ok) throw new Error(`Failed to sync ${provider}`);
        return response.json();
      })
    );

    const results = syncResults.map((result, index) => ({
      provider: providers[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));

    return NextResponse.json({
      success: true,
      results,
      totalSynced: results.filter(r => r.success).length,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Financial sync error:', error);
    return NextResponse.json({ error: 'Failed to sync financial data' }, { status: 500 });
  }
}
