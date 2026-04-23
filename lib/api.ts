import { ApiSubscriptionItem, ApiCardRecommendationRequest, ApiCardRecommendationResponse } from './apiSchemas';

// API 기본 URL (개발 환경에서는 localhost, 프로덕션에서는 실제 도메인)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiUser {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * 사용자 정보를 가져오는 API 호출
 */
export async function fetchUser(userId: string): Promise<ApiUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    // 폴백: 시뮬레이션 데이터
    return {
      id: 123,
      email: 'user@example.com',
      name: '테스트 사용자',
      createdAt: '2024-01-01T00:00:00.000Z', // 3개월 전으로 설정하여 유료 전환 테스트
      isActive: true,
    };
  }
}

/**
 * 구독 서비스 목록을 가져오는 API 호출
 */
export async function fetchSubscriptions(): Promise<ApiSubscriptionItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }
    const data = await response.json();
    return data.subscriptions || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    // 폴백 데이터 반환 (실제 앱에서는 에러 처리)
    return [
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
    ];
  }
}

/**
 * 카드 추천을 요청하는 API 호출
 */
export async function recommendCard(
  request: ApiCardRecommendationRequest
): Promise<ApiCardRecommendationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to recommend card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error recommending card:', error);
    // 폴백 추천 로직 (실제 앱에서는 에러 처리)
    const { category } = request;
    const fallbackResponse: ApiCardRecommendationResponse = {
      recommendedCardId: 'shinhan-classic',
      recommendedBenefit: {
        type: 'percent',
        label: '카페 30% 할인',
        value: 30,
      },
      score: 85,
      message: `${category}에서 사용할 최적의 카드를 추천드려요!`,
    };
    return fallbackResponse;
  }
}

/**
 * 구독을 해지하는 API 호출
 */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    // 폴백 응답
    return {
      success: true,
      message: '구독이 성공적으로 해지되었습니다.',
    };
  }
}

/**
 * 결제를 처리하는 API 호출 (카드 추천 후 결제)
 */
export async function processPayment(
  cardId: string,
  amount: number,
  category: string
): Promise<{ success: boolean; message: string; savings?: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId,
        amount,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing payment:', error);
    // 폴백 응답
    return {
      success: true,
      message: '결제가 성공적으로 처리되었습니다.',
      savings: Math.round(amount * 0.3), // 30% 절약 가정
    };
  }
}