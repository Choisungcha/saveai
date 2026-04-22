/**
 * API 모델 예시
 *
 * 추천 카드 요청
 * {
 *   "userId": "user_123",
 *   "location": "강남",
 *   "category": "스타벅스",
 *   "cards": [
 *     {
 *       "id": "shinhan-classic",
 *       "name": "신한카드 The CLASSIC",
 *       "bank": "신한카드",
 *       "benefits": {
 *         "스타벅스": {
 *           "type": "percent",
 *           "label": "카페 30% 할인",
 *           "value": 30
 *         }
 *       },
 *       "remainingThreshold": {
 *         "label": "전월 실적까지",
 *         "amount": 5000
 *       }
 *     }
 *   ]
 * }
 */

export type BenefitType = 'percent' | 'fixed' | 'cashback';

export interface CardBenefit {
  label: string;
  type: BenefitType;
  value: number;
  bonusText?: string;
}

export interface UserCard {
  id: string;
  name: string;
  bank: string;
  logo: string;
  color: string;
  benefits: Record<string, CardBenefit>;
  monthlySpendEstimate: number;
  remainingThreshold?: {
    label: string;
    amount: number;
  };
}

export const locations = ['강남', '홍대', '여의도'];
export const categories = ['스타벅스', '편의점', '주유소', '식당', '온라인 쇼핑'];

export const cards: UserCard[] = [
  {
    id: 'shinhan-classic',
    name: '신한카드 The CLASSIC',
    bank: '신한카드',
    logo: 'SC',
    color: '#22C55E',
    monthlySpendEstimate: 460000,
    remainingThreshold: {
      label: '전월 실적까지',
      amount: 5000,
    },
    benefits: {
      '스타벅스': { label: '카페 30% 할인', type: 'percent', value: 30, bonusText: '커피 할인 최강!' },
      '편의점': { label: '1.5% 캐시백', type: 'cashback', value: 1.5 },
      '주유소': { label: '리터당 60원 할인', type: 'fixed', value: 60 },
      '식당': { label: '5% 청구할인', type: 'percent', value: 5 },
      '온라인 쇼핑': { label: '1% 적립', type: 'cashback', value: 1 },
    },
  },
  {
    id: 'hana-card',
    name: '하나카드 1Q',
    bank: '하나카드',
    logo: 'HC',
    color: '#0EA5E9',
    monthlySpendEstimate: 320000,
    remainingThreshold: {
      label: '전월 실적까지',
      amount: 18000,
    },
    benefits: {
      '스타벅스': { label: '10% 할인 + 1,500원 캐시백', type: 'percent', value: 10, bonusText: '소비할 때마다 현금 혜택' },
      '편의점': { label: '5% 할인', type: 'percent', value: 5 },
      '주유소': { label: '3% 적립', type: 'cashback', value: 3 },
      '식당': { label: '10% 할인', type: 'percent', value: 10 },
      '온라인 쇼핑': { label: '2% 적립', type: 'cashback', value: 2 },
    },
  },
  {
    id: 'kb-card',
    name: 'KB국민 리브메이트',
    bank: 'KB국민',
    logo: 'KB',
    color: '#64748B',
    monthlySpendEstimate: 380000,
    remainingThreshold: {
      label: '전월 실적까지',
      amount: 12000,
    },
    benefits: {
      '스타벅스': { label: '5,000원 할인', type: 'fixed', value: 5000 },
      '편의점': { label: '2% 적립', type: 'cashback', value: 2 },
      '주유소': { label: '7% 캐시백', type: 'cashback', value: 7 },
      '식당': { label: '3% 할인', type: 'percent', value: 3 },
      '온라인 쇼핑': { label: '3% 적립', type: 'cashback', value: 3 },
    },
  },
];

function computeBenefitScore(benefit: CardBenefit, monthlyEstimate: number) {
  if (benefit.type === 'percent') {
    return benefit.value * (monthlyEstimate / 100000);
  }
  if (benefit.type === 'cashback') {
    return benefit.value * (monthlyEstimate / 80000);
  }
  return benefit.value / 1000;
}

export function getCashbackEstimate(card: UserCard, category: string) {
  const benefit = card.benefits[category];
  if (!benefit) return 0;

  const spend = card.monthlySpendEstimate;
  if (benefit.type === 'percent' || benefit.type === 'cashback') {
    return Math.round(spend * (benefit.value / 100));
  }

  return Math.round(benefit.value * 4);
}

export function recommendBestCard(category: string, location: string) {
  return cards
    .map((card) => {
      const benefit = card.benefits[category];
      const baseScore = benefit ? computeBenefitScore(benefit, card.monthlySpendEstimate) : 0;
      const thresholdBonus = card.remainingThreshold
        ? Math.max(0, 10 - card.remainingThreshold.amount / 2000)
        : 0;
      const locationBonus = location === '강남' && category === '스타벅스' && card.id === 'shinhan-classic' ? 5 : 0;
      return {
        ...card,
        score: baseScore + thresholdBonus + locationBonus,
        recommendedBenefit: benefit,
      };
    })
    .sort((a, b) => b.score - a.score)[0];
}
