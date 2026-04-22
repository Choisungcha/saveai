export interface ExpenseCategory {
  label: string;
  amount: number;
  trend: 'up' | 'down' | 'steady';
  change: number;
  color: string;
}

export interface ExpenseInsight {
  title: string;
  description: string;
  impact: number;
  action: string;
  category: string;
}

export const expenseCategories: ExpenseCategory[] = [
  { label: '구독', amount: 78000, trend: 'steady', change: -1.8, color: '#22C55E' },
  { label: '외식', amount: 58000, trend: 'up', change: 9.7, color: '#f97316' },
  { label: '통신', amount: 46000, trend: 'down', change: -3.2, color: '#38bdf8' },
  { label: '쇼핑', amount: 35000, trend: 'up', change: 4.5, color: '#a855f7' },
  { label: '교통', amount: 22000, trend: 'steady', change: 0.5, color: '#facc15' },
  { label: '기타', amount: 20000, trend: 'down', change: -2.1, color: '#64748b' },
];

export const expenseInsights: ExpenseInsight[] = [
  {
    title: '구독 정리 서비스',
    category: '구독',
    description: '미사용 구독을 자동 분석하여 해지 또는 요금제를 제안합니다.',
    impact: 17000,
    action: '구독 해지 / 교체하기',
  },
  {
    title: '외식 할인 추천',
    category: '외식',
    description: '자주 가는 식당별 최적 카드와 프로모션을 자동 추천합니다.',
    impact: 12000,
    action: '할인 카드 바로 확인',
  },
  {
    title: '통신 요금 진단',
    category: '통신',
    description: '현재 요금제를 분석해 더 저렴한 요금제를 찾아드립니다.',
    impact: 8000,
    action: '요금제 비교하기',
  },
  {
    title: '쇼핑 캐시백 최적화',
    category: '쇼핑',
    description: '주요 쇼핑 채널에 맞춘 캐시백 카드와 혜택을 자동 제안합니다.',
    impact: 6000,
    action: '혜택 받기',
  },
];

export function getTotalSpend() {
  return expenseCategories.reduce((sum, item) => sum + item.amount, 0);
}

export function getEstimatedSavings() {
  return expenseInsights.reduce((sum, insight) => sum + insight.impact, 0);
}
