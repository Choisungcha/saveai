import { NextResponse } from 'next/server';
import { ApiSubscriptionItem } from '../../../lib/apiSchemas';

// 모의 구독 데이터 (실제로는 데이터베이스나 외부 API에서 가져옴)
const mockSubscriptions: ApiSubscriptionItem[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    plan: '프리미엄',
    amount: 17900,
    currency: 'KRW',
    dueDate: '2026-05-13',
    status: 'active',
    estimatedAnnualSavings: 204000,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    plan: '프리미엄',
    amount: 10900,
    currency: 'KRW',
    dueDate: '2026-05-15',
    status: 'active',
    estimatedAnnualSavings: 120000,
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    plan: '프리미엄',
    amount: 13900,
    currency: 'KRW',
    dueDate: '2026-05-20',
    status: 'active',
    estimatedAnnualSavings: 156000,
  },
  {
    id: 'watcha',
    name: '왓챠',
    plan: '프리미엄',
    amount: 12900,
    currency: 'KRW',
    dueDate: '2026-05-25',
    status: 'inactive',
    estimatedAnnualSavings: 144000,
  },
];

export async function GET() {
  try {
    // 실제로는 데이터베이스 쿼리나 외부 API 호출
    return NextResponse.json({
      subscriptions: mockSubscriptions,
      totalCount: mockSubscriptions.length,
      totalMonthlySpend: mockSubscriptions
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => sum + sub.amount, 0),
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}