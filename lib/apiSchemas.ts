/**
 * API 데이터 구조 예시
 *
 * 구독 서비스 목록 응답
 * {
 *   "subscriptions": [
 *     {
 *       "id": "netflix",
 *       "name": "Netflix",
 *       "plan": "프리미엄",
 *       "amount": 17900,
 *       "currency": "KRW",
 *       "dueDate": "2026-05-13",
 *       "status": "inactive",
 *       "estimatedAnnualSavings": 204000
 *     }
 *   ]
 * }
 *
 * 카드 추천 요청
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

export interface ApiSubscriptionItem {
  id: string;
  name: string;
  plan: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'active' | 'inactive' | 'paused' | 'cancelled';
  estimatedAnnualSavings: number;
}

export interface ApiBenefit {
  type: 'percent' | 'fixed' | 'cashback';
  label: string;
  value: number;
}

export interface ApiCardRecommendationRequest {
  userId: string;
  location: string;
  category: string;
  cards: Array<{
    id: string;
    name: string;
    bank: string;
    benefits: Record<string, ApiBenefit>;
    remainingThreshold?: {
      label: string;
      amount: number;
    };
  }>;
}

export interface ApiCardRecommendationResponse {
  recommendedCardId: string;
  recommendedBenefit: ApiBenefit;
  score: number;
  message: string;
}
